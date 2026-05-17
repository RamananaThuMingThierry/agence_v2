<?php

namespace App\Services;

use App\Interfaces\PlatformSettingInterface;
use App\Models\PlatformSetting;

class PlatformSettingService
{
    public function __construct(private PlatformSettingInterface $platformSettingRepository) {}

    public function getPlatformSetting(array $fields = ['*']): PlatformSetting
    {
        $platformSetting = $this->platformSettingRepository->first($fields);

        if ($platformSetting) {
            return $platformSetting;
        }

        return $this->platformSettingRepository->create([
            'platform_name' => 'WORLD OF MADAGASCAR',
        ]);
    }

    public function updatePlatformSetting(PlatformSetting $platformSetting, array $data): ?PlatformSetting
    {
        return $this->platformSettingRepository->update($platformSetting, $data);
    }
}
