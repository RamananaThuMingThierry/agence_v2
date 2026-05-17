<?php

namespace App\Repositories;

use App\Interfaces\PlatformSettingInterface;
use App\Models\PlatformSetting;

class PlatformSettingRepository extends BaseRepository implements PlatformSettingInterface
{
    public function first(array $fields = ['*']): ?PlatformSetting
    {
        $fields = $this->withRequiredColumns($fields);

        return PlatformSetting::query()->first($fields);
    }

    public function create(array $data): ?PlatformSetting
    {
        return PlatformSetting::create($data);
    }

    public function update(PlatformSetting $platformSetting, array $data): ?PlatformSetting
    {
        $platformSetting->update($data);

        return $platformSetting->fresh();
    }
}
