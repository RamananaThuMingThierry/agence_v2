<?php

namespace App\Interfaces;

use App\Models\PlatformSetting;

interface PlatformSettingInterface
{
    public function first(array $fields = ['*']): ?PlatformSetting;

    public function create(array $data): ?PlatformSetting;

    public function update(PlatformSetting $platformSetting, array $data): ?PlatformSetting;
}
