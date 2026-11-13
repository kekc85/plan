<?php
/**
 * Lydia DCS Connector Configuration (Template)
 * Скопируйте этот файл в dcs_config.php и укажите ваши учетные данные.
 * Файл dcs_config.php добавлен в .gitignore и защищен от попадания в git.
 */

return [
    'base_url' => 'https://newdcs.nwsesys.com/ADSDCS',
    'username' => 'YOUR_USERNAME',
    'password' => 'YOUR_PASSWORD',
    'airline'  => 'N4',
    'default_locations' => ['DYU', 'NMA', 'TJU', 'SKD', 'TAS', 'CXR', 'IST'],
    'request_delay_ms' => 600, // Человекоподобная задержка между запросами к DCS (мс)
];
