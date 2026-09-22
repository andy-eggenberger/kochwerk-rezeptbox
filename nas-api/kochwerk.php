<?php

declare(strict_types=1);

$config = require __DIR__ . '/kochwerk-config.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $status, array $payload): void {
    http_response_code($status);
    echo json_encode(
        $payload,
        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES |
        JSON_PRETTY_PRINT
    );
    exit;
}

function revision(string $file): ?string {
    return is_file($file)
        ? hash_file('sha256', $file)
        : null;
}

function streamStoredData(
    string $file,
    string $fileRevision,
    string $updatedAt
): void {
    $handle = fopen($file, 'rb');

    if ($handle === false) {
        respond(
            500,
            [
                'ok' => false,
                'error' => 'stored_data_unreadable',
            ]
        );
    }

    http_response_code(200);

    echo '{"ok":true,"exists":true,"revision":';
    echo json_encode($fileRevision, JSON_UNESCAPED_SLASHES);
    echo ',"updatedAt":';
    echo json_encode($updatedAt, JSON_UNESCAPED_SLASHES);
    echo ',"data":';

    while (!feof($handle)) {
        $chunk = fread($handle, 1048576);

        if ($chunk === false) {
            fclose($handle);
            exit;
        }

        echo $chunk;
    }

    fclose($handle);
    echo '}';
    exit;
}

$origin = (string)($_SERVER['HTTP_ORIGIN'] ?? '');

if ($origin !== '') {
    if (!in_array(
        $origin,
        $config['allowed_origins'] ?? [],
        true
    )) {
        respond(
            403,
            [
                'ok' => false,
                'error' => 'origin_not_allowed',
            ]
        );
    }

    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header(
        'Access-Control-Allow-Headers: Content-Type, X-Kochwerk-Key'
    );
    header('Access-Control-Max-Age: 600');
}

$method = (string)(
    $_SERVER['REQUEST_METHOD'] ?? 'GET'
);

if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$rawInput = file_get_contents('php://input');

$body =
    is_string($rawInput) &&
    $rawInput !== ''
        ? json_decode($rawInput, true)
        : null;

if (!is_array($body)) {
    $body = [];
}

$givenKey = trim(
    (string)(
        $_SERVER['HTTP_X_KOCHWERK_KEY'] ??
        ($body['key'] ?? '')
    )
);

$syncKey = (string)(
    $config['sync_key'] ?? ''
);

if (
    $syncKey === '' ||
    !hash_equals($syncKey, $givenKey)
) {
    respond(
        401,
        [
            'ok' => false,
            'error' => 'unauthorized',
        ]
    );
}

$dataDir = (string)(
    $config['data_dir'] ?? ''
);

if ($dataDir === '') {
    respond(500, ['ok'=>false, 'error'=>'data_directory_not_configured']);
}

$dataFile =
    $dataDir .
    DIRECTORY_SEPARATOR .
    'kochwerk.json';

$backupDir =
    $dataDir .
    DIRECTORY_SEPARATOR .
    'sicherungen';

$imageDir =
    $dataDir .
    DIRECTORY_SEPARATOR .
    'bilder';

$lockFile =
    $dataDir .
    DIRECTORY_SEPARATOR .
    '.kochwerk.lock';

$maxBytes = (int)(
    $config['max_upload_bytes'] ??
    104857600
);

$action = (string)(
    $_GET['action'] ??
    ($body['action'] ?? 'status')
);

if (
    !is_dir($dataDir) ||
    !is_writable($dataDir)
) {
    respond(
        500,
        [
            'ok' => false,
            'error' => 'data_directory_not_writable',
        ]
    );
}

if (
    ($method === 'GET' || $method === 'POST') &&
    $action === 'status'
) {
    respond(
        200,
        [
            'ok' => true,
            'service' => 'Kochwerk NAS-API',
            'apiVersion' => 2,
            'dataExists' => is_file($dataFile),
            'revision' => revision($dataFile),
            'updatedAt' =>
                is_file($dataFile)
                    ? gmdate(
                        DATE_ATOM,
                        (int)filemtime($dataFile)
                    )
                    : null,
            'maxUploadBytes' => $maxBytes,
        ]
    );
}

if (
    $method === 'POST' &&
    $action === 'images-missing'
) {
    $ids = $body['ids'] ?? null;

    if (!is_array($ids) || count($ids) > 5000) {
        respond(422, ['ok' => false, 'error' => 'invalid_image_ids']);
    }

    $missing = [];

    foreach ($ids as $id) {
        if (!is_string($id) || !preg_match('/^[a-f0-9]{64}$/', $id)) {
            respond(422, ['ok' => false, 'error' => 'invalid_image_id']);
        }

        $matches = glob($imageDir . DIRECTORY_SEPARATOR . $id . '.*');

        if (!is_array($matches) || count($matches) === 0) {
            $missing[] = $id;
        }
    }

    respond(200, ['ok' => true, 'missing' => $missing]);
}

if (
    $method === 'POST' &&
    $action === 'image-upload'
) {
    $id = (string)($_GET['id'] ?? '');

    if (!preg_match('/^[a-f0-9]{64}$/', $id)) {
        respond(422, ['ok' => false, 'error' => 'invalid_image_id']);
    }

    if ($rawInput === false || $rawInput === '' || strlen($rawInput) > 10485760) {
        respond(413, ['ok' => false, 'error' => 'invalid_image_payload']);
    }

    if (!hash_equals($id, hash('sha256', $rawInput))) {
        respond(422, ['ok' => false, 'error' => 'image_hash_mismatch']);
    }

    $mime = strtolower(trim((string)($_SERVER['CONTENT_TYPE'] ?? '')));
    $extensions = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
    ];

    if (!isset($extensions[$mime])) {
        respond(415, ['ok' => false, 'error' => 'image_type_not_allowed']);
    }

    if (!is_dir($imageDir) && !mkdir($imageDir, 0770, true) && !is_dir($imageDir)) {
        respond(500, ['ok' => false, 'error' => 'image_directory_failed']);
    }

    $target = $imageDir . DIRECTORY_SEPARATOR . $id . '.' . $extensions[$mime];

    if (!is_file($target)) {
        $temp =
            $imageDir .
            DIRECTORY_SEPARATOR .
            '.' . $id . '-' . bin2hex(random_bytes(4)) . '.tmp';
        $written = file_put_contents($temp, $rawInput, LOCK_EX);

        if ($written !== strlen($rawInput) || !rename($temp, $target)) {
            @unlink($temp);
            respond(500, ['ok' => false, 'error' => 'image_write_failed']);
        }
    }

    respond(200, ['ok' => true, 'id' => $id]);
}

if (
    $method === 'GET' &&
    $action === 'image'
) {
    $id = (string)($_GET['id'] ?? '');

    if (!preg_match('/^[a-f0-9]{64}$/', $id)) {
        respond(422, ['ok' => false, 'error' => 'invalid_image_id']);
    }

    $matches = glob($imageDir . DIRECTORY_SEPARATOR . $id . '.*');

    if (!is_array($matches) || count($matches) === 0 || !is_file($matches[0])) {
        respond(404, ['ok' => false, 'error' => 'image_not_found']);
    }

    $file = $matches[0];
    $extension = strtolower((string)pathinfo($file, PATHINFO_EXTENSION));
    $mimeTypes = [
        'jpg' => 'image/jpeg',
        'png' => 'image/png',
        'webp' => 'image/webp',
        'gif' => 'image/gif',
    ];

    header('Content-Type: ' . ($mimeTypes[$extension] ?? 'application/octet-stream'));
    header('Content-Length: ' . (string)filesize($file));
    readfile($file);
    exit;
}

if (
    ($method === 'GET' || $method === 'POST') &&
    $action === 'pull'
) {
    if (!is_file($dataFile)) {
        respond(
            200,
            [
                'ok' => true,
                'exists' => false,
                'revision' => null,
                'data' => null,
            ]
        );
    }

    $fileRevision = revision($dataFile);

    if ($fileRevision === null) {
        respond(
            500,
            [
                'ok' => false,
                'error' => 'stored_data_unreadable',
            ]
        );
    }

    streamStoredData(
        $dataFile,
        $fileRevision,
        gmdate(
            DATE_ATOM,
            (int)filemtime($dataFile)
        )
    );
}

if (
    $method === 'POST' &&
    $action === 'push'
) {
    if (
        (int)(
            $_SERVER['CONTENT_LENGTH'] ?? 0
        ) > $maxBytes
    ) {
        respond(
            413,
            [
                'ok' => false,
                'error' => 'payload_too_large',
            ]
        );
    }

    if (
        $rawInput === false ||
        $rawInput === '' ||
        strlen($rawInput) > $maxBytes
    ) {
        respond(
            400,
            [
                'ok' => false,
                'error' => 'empty_or_oversized_payload',
            ]
        );
    }

    $data = $body['data'] ?? null;
    $baseRevision =
        $body['baseRevision'] ?? null;
    $force =
        ($body['force'] ?? false) === true;

    if (
        !is_array($data) ||
        ($data['app'] ?? '') !== 'Kochwerk' ||
        !isset($data['recipes']) ||
        !is_array($data['recipes']) ||
        !isset($data['categories']) ||
        !is_array($data['categories']) ||
        !isset($data['collections']) ||
        !is_array($data['collections'])
    ) {
        respond(
            422,
            [
                'ok' => false,
                'error' => 'invalid_kochwerk_data',
            ]
        );
    }

    foreach ($data['recipes'] as $recipe) {
        if (!is_array($recipe)) {
            respond(422, ['ok' => false, 'error' => 'invalid_recipe']);
        }

        $imageId = $recipe['sourceImageId'] ?? null;

        if ($imageId === null || $imageId === '') {
            continue;
        }

        if (!is_string($imageId) || !preg_match('/^[a-f0-9]{64}$/', $imageId)) {
            respond(422, ['ok' => false, 'error' => 'invalid_recipe_image_id']);
        }

        $imageMatches = glob($imageDir . DIRECTORY_SEPARATOR . $imageId . '.*');

        if (!is_array($imageMatches) || count($imageMatches) === 0) {
            respond(422, ['ok' => false, 'error' => 'recipe_image_missing']);
        }
    }

    $lock = fopen(
        $lockFile,
        'c+'
    );

    if (
        $lock === false ||
        !flock($lock, LOCK_EX)
    ) {
        respond(
            500,
            [
                'ok' => false,
                'error' => 'lock_failed',
            ]
        );
    }

    $current =
        revision($dataFile);

    if (
        !$force &&
        $current !== null &&
        (
            !is_string($baseRevision) ||
            !hash_equals(
                $current,
                $baseRevision
            )
        )
    ) {
        flock($lock, LOCK_UN);
        fclose($lock);

        respond(
            409,
            [
                'ok' => false,
                'error' => 'revision_conflict',
                'currentRevision' => $current,
            ]
        );
    }

    $data['serverStoredAt'] =
        gmdate(DATE_ATOM);

    $encoded = json_encode(
        $data,
        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES
    );

    if ($encoded === false) {
        flock($lock, LOCK_UN);
        fclose($lock);

        respond(
            422,
            [
                'ok' => false,
                'error' => 'json_encoding_failed',
            ]
        );
    }

    if (is_file($dataFile)) {
        if (
            !is_dir($backupDir) &&
            !mkdir(
                $backupDir,
                0770,
                true
            ) &&
            !is_dir($backupDir)
        ) {
            flock($lock, LOCK_UN);
            fclose($lock);

            respond(
                500,
                [
                    'ok' => false,
                    'error' => 'backup_directory_failed',
                ]
            );
        }

        $backup =
            $backupDir .
            DIRECTORY_SEPARATOR .
            'kochwerk-' .
            gmdate('Ymd-His') .
            '-' .
            substr(
                (string)$current,
                0,
                8
            ) .
            '.json';

        if (
            !copy(
                $dataFile,
                $backup
            )
        ) {
            flock($lock, LOCK_UN);
            fclose($lock);

            respond(
                500,
                [
                    'ok' => false,
                    'error' => 'backup_failed',
                ]
            );
        }
    }

    $temp =
        $dataDir .
        DIRECTORY_SEPARATOR .
        '.kochwerk-' .
        bin2hex(random_bytes(6)) .
        '.tmp';

    $written = file_put_contents(
        $temp,
        $encoded,
        LOCK_EX
    );

    if (
        $written !== strlen($encoded) ||
        !rename($temp, $dataFile)
    ) {
        @unlink($temp);
        flock($lock, LOCK_UN);
        fclose($lock);

        respond(
            500,
            [
                'ok' => false,
                'error' => 'write_failed',
            ]
        );
    }

    $newRevision =
        revision($dataFile);

    flock($lock, LOCK_UN);
    fclose($lock);

    respond(
        200,
        [
            'ok' => true,
            'revision' => $newRevision,
            'updatedAt' => gmdate(
                DATE_ATOM,
                (int)filemtime($dataFile)
            ),
            'recipeCount' =>
                count($data['recipes']),
            'categoryCount' =>
                count($data['categories']),
            'collectionCount' =>
                count($data['collections']),
        ]
    );
}

respond(
    404,
    [
        'ok' => false,
        'error' => 'unknown_action',
    ]
);
