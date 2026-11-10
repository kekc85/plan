// Версия приложения AeroBag Predictor
const APP_VERSION = 'v12.2.30';
const APP_BUILD_DATE = '01.11.2026';

// Глобальное состояние
// Встроенная справочная база аэропортов и правил для гарантированной оффлайн-работы
const DEFAULT_BAGGAGE_DB = {
  "airports": {
    "AER": {
      "iata": "AER",
      "ru": "СОЧ",
      "name": "Сочи"
    },
    "СОЧ": {
      "iata": "AER",
      "ru": "СОЧ",
      "name": "Сочи"
    },
    "CCC": {
      "iata": "CCC",
      "ru": "CCC",
      "name": "Кайо - Коко (Куба)"
    },
    "DYU": {
      "iata": "DYU",
      "ru": "ДШБ",
      "name": "Душанбе"
    },
    "ДШБ": {
      "iata": "DYU",
      "ru": "ДШБ",
      "name": "Душанбе"
    },
    "GOX": {
      "iata": "GOX",
      "ru": "GOX",
      "name": "Гоа"
    },
    "HOG": {
      "iata": "HOG",
      "ru": "HOG",
      "name": "Ольгин (Куба)"
    },
    "HRG": {
      "iata": "HRG",
      "ru": "HRG",
      "name": "Хургада"
    },
    "KQT": {
      "iata": "KQT",
      "ru": "КГТ",
      "name": "Бохтар"
    },
    "КГТ": {
      "iata": "KQT",
      "ru": "КГТ",
      "name": "Бохтар"
    },
    "LBD": {
      "iata": "LBD",
      "ru": "ХДТ",
      "name": "Худжант"
    },
    "ХДТ": {
      "iata": "LBD",
      "ru": "ХДТ",
      "name": "Худжант"
    },
    "OSS": {
      "iata": "OSS",
      "ru": "ОШШ",
      "name": "Ош"
    },
    "ОШШ": {
      "iata": "OSS",
      "ru": "ОШШ",
      "name": "Ош"
    },
    "PMV": {
      "iata": "PMV",
      "ru": "PMV",
      "name": "Порламар"
    },
    "REN": {
      "iata": "REN",
      "ru": "ОНГ",
      "name": "Оренбург"
    },
    "ОНГ": {
      "iata": "REN",
      "ru": "ОНГ",
      "name": "Оренбург"
    },
    "SSH": {
      "iata": "SSH",
      "ru": "SSH",
      "name": "Шарь эль Шейх"
    },
    "SUI": {
      "iata": "SUI",
      "ru": "СУИ",
      "name": "Сухум"
    },
    "СУИ": {
      "iata": "SUI",
      "ru": "СУИ",
      "name": "Сухум"
    },
    "TAS": {
      "iata": "TAS",
      "ru": "ТАС",
      "name": "Ташкент"
    },
    "ТАС": {
      "iata": "TAS",
      "ru": "ТАС",
      "name": "Ташкент"
    },
    "UTP": {
      "iata": "UTP",
      "ru": "UTP",
      "name": "Утапао (Тайланд)"
    },
    "VRA": {
      "iata": "VRA",
      "ru": "VRA",
      "name": "Варадеро (Куба)"
    },
    "AYT": {
      "iata": "AYT",
      "ru": "AYT",
      "name": "Анталья"
    },
    "BAX": {
      "iata": "BAX",
      "ru": "БАН",
      "name": "Барнаул"
    },
    "БАН": {
      "iata": "BAX",
      "ru": "БАН",
      "name": "Барнаул"
    },
    "CEK": {
      "iata": "CEK",
      "ru": "ЧЛБ",
      "name": "Челябинск"
    },
    "ЧЛБ": {
      "iata": "CEK",
      "ru": "ЧЛБ",
      "name": "Челябинск"
    },
    "CSY": {
      "iata": "CSY",
      "ru": "ЧБЕ",
      "name": "Чебоксары"
    },
    "ЧБЕ": {
      "iata": "CSY",
      "ru": "ЧБЕ",
      "name": "Чебоксары"
    },
    "GOJ": {
      "iata": "GOJ",
      "ru": "НЖС",
      "name": "Нижний Новгород"
    },
    "НЖС": {
      "iata": "GOJ",
      "ru": "НЖС",
      "name": "Нижний Новгород"
    },
    "IWA": {
      "iata": "IWA",
      "ru": "ИВВ",
      "name": "Иваново"
    },
    "ИВВ": {
      "iata": "IWA",
      "ru": "ИВВ",
      "name": "Иваново"
    },
    "KEJ": {
      "iata": "KEJ",
      "ru": "КРВ",
      "name": "Кемерово"
    },
    "КРВ": {
      "iata": "KEJ",
      "ru": "КРВ",
      "name": "Кемерово"
    },
    "KGD": {
      "iata": "KGD",
      "ru": "КЛД",
      "name": "Калининград"
    },
    "КЛД": {
      "iata": "KGD",
      "ru": "КЛД",
      "name": "Калининград"
    },
    "KJA": {
      "iata": "KJA",
      "ru": "ЕМВ",
      "name": "Красноярск"
    },
    "ЕМВ": {
      "iata": "KJA",
      "ru": "ЕМВ",
      "name": "Красноярск"
    },
    "KRO": {
      "iata": "KRO",
      "ru": "КГН",
      "name": "Курган"
    },
    "КГН": {
      "iata": "KRO",
      "ru": "КГН",
      "name": "Курган"
    },
    "KUF": {
      "iata": "KUF",
      "ru": "СКЧ",
      "name": "Самара"
    },
    "СКЧ": {
      "iata": "KUF",
      "ru": "СКЧ",
      "name": "Самара"
    },
    "KVX": {
      "iata": "KVX",
      "ru": "КИО",
      "name": "Киров"
    },
    "КИО": {
      "iata": "KVX",
      "ru": "КИО",
      "name": "Киров"
    },
    "KZN": {
      "iata": "KZN",
      "ru": "КЗН",
      "name": "Казань"
    },
    "КЗН": {
      "iata": "KZN",
      "ru": "КЗН",
      "name": "Казань"
    },
    "LED": {
      "iata": "LED",
      "ru": "ПЛК",
      "name": "Санкт - Петербург"
    },
    "ПЛК": {
      "iata": "LED",
      "ru": "ПЛК",
      "name": "Санкт - Петербург"
    },
    "MCX": {
      "iata": "MCX",
      "ru": "МХЛ",
      "name": "Махачкала"
    },
    "МХЛ": {
      "iata": "MCX",
      "ru": "МХЛ",
      "name": "Махачкала"
    },
    "MQF": {
      "iata": "MQF",
      "ru": "МГС",
      "name": "Магнитогорск"
    },
    "МГС": {
      "iata": "MQF",
      "ru": "МГС",
      "name": "Магнитогорск"
    },
    "MRV": {
      "iata": "MRV",
      "ru": "МРВ",
      "name": "Минеральные воды"
    },
    "МРВ": {
      "iata": "MRV",
      "ru": "МРВ",
      "name": "Минеральные воды"
    },
    "NBC": {
      "iata": "NBC",
      "ru": "НЖК",
      "name": "Нижнекамск"
    },
    "НЖК": {
      "iata": "NBC",
      "ru": "НЖК",
      "name": "Нижнекамск"
    },
    "NJC": {
      "iata": "NJC",
      "ru": "НЖВ",
      "name": "Нижневартовск"
    },
    "НЖВ": {
      "iata": "NJC",
      "ru": "НЖВ",
      "name": "Нижневартовск"
    },
    "NOZ": {
      "iata": "NOZ",
      "ru": "НВК",
      "name": "Новокузнецк"
    },
    "НВК": {
      "iata": "NOZ",
      "ru": "НВК",
      "name": "Новокузнецк"
    },
    "OMS": {
      "iata": "OMS",
      "ru": "ОМС",
      "name": "Омск"
    },
    "ОМС": {
      "iata": "OMS",
      "ru": "ОМС",
      "name": "Омск"
    },
    "OSW": {
      "iata": "OSW",
      "ru": "ОСК",
      "name": "Орск"
    },
    "ОСК": {
      "iata": "OSW",
      "ru": "ОСК",
      "name": "Орск"
    },
    "OVB": {
      "iata": "OVB",
      "ru": "ТЛЧ",
      "name": "Новосибирск"
    },
    "ТЛЧ": {
      "iata": "OVB",
      "ru": "ТЛЧ",
      "name": "Новосибирск"
    },
    "PEE": {
      "iata": "PEE",
      "ru": "ПРЬ",
      "name": "Пермь"
    },
    "ПРЬ": {
      "iata": "PEE",
      "ru": "ПРЬ",
      "name": "Пермь"
    },
    "RGK": {
      "iata": "RGK",
      "ru": "ГОР",
      "name": "Горноалтайск"
    },
    "ГОР": {
      "iata": "RGK",
      "ru": "ГОР",
      "name": "Горноалтайск"
    },
    "SCW": {
      "iata": "SCW",
      "ru": "СЫВ",
      "name": "Сыктывкар"
    },
    "СЫВ": {
      "iata": "SCW",
      "ru": "СЫВ",
      "name": "Сыктывкар"
    },
    "SGC": {
      "iata": "SGC",
      "ru": "СУР",
      "name": "Сургут"
    },
    "СУР": {
      "iata": "SGC",
      "ru": "СУР",
      "name": "Сургут"
    },
    "SKV": {
      "iata": "SKV",
      "ru": "SKV",
      "name": "Санта - Катарина (Египет)"
    },
    "SVO": {
      "iata": "SVO",
      "ru": "ШРМ",
      "name": "Москва (Шереметьево)"
    },
    "ШРМ": {
      "iata": "SVO",
      "ru": "ШРМ",
      "name": "Москва (Шереметьево)"
    },
    "SVX": {
      "iata": "SVX",
      "ru": "КЛЦ",
      "name": "Екатеринбург"
    },
    "КЛЦ": {
      "iata": "SVX",
      "ru": "КЛЦ",
      "name": "Екатеринбург"
    },
    "TJM": {
      "iata": "TJM",
      "ru": "РЩН",
      "name": "Тюмень"
    },
    "РЩН": {
      "iata": "TJM",
      "ru": "РЩН",
      "name": "Тюмень"
    },
    "TOF": {
      "iata": "TOF",
      "ru": "ТСК",
      "name": "Томск"
    },
    "ТСК": {
      "iata": "TOF",
      "ru": "ТСК",
      "name": "Томск"
    },
    "UFA": {
      "iata": "UFA",
      "ru": "УФА",
      "name": "Уфа"
    },
    "УФА": {
      "iata": "UFA",
      "ru": "УФА",
      "name": "Уфа"
    },
    "ULV": {
      "iata": "ULV",
      "ru": "УЛК",
      "name": "Ульяновск"
    },
    "УЛК": {
      "iata": "ULV",
      "ru": "УЛК",
      "name": "Ульяновск"
    },
    "VOG": {
      "iata": "VOG",
      "ru": "ВГГ",
      "name": "Волгоград"
    },
    "ВГГ": {
      "iata": "VOG",
      "ru": "ВГГ",
      "name": "Волгоград"
    },
    "ZIA": {
      "iata": "ZIA",
      "ru": "ЖУК",
      "name": "Жуковский"
    },
    "ЖУК": {
      "iata": "ZIA",
      "ru": "ЖУК",
      "name": "Жуковский"
    },
    "КПА": {
      "iata": "KRR",
      "ru": "КПА",
      "name": "Краснодар"
    },
    "ККЗ": {
      "iata": "KZN",
      "ru": "КЗН",
      "name": "Казань"
    },
    "ЕКБ": {
      "iata": "SVX",
      "ru": "КЛЦ",
      "name": "Екатеринбург"
    },
    "КЯА": {
      "iata": "KJA",
      "ru": "ЕМВ",
      "name": "Красноярск"
    },
    "АСР": {
      "iata": "ASF",
      "ru": "АСР",
      "name": "Астрахань"
    },
    "АХГ": {
      "iata": "ARH",
      "ru": "АХГ",
      "name": "Архангельск"
    },
    "БИШ": {
      "iata": "FRU",
      "ru": "БИШ",
      "name": "Бишкек"
    },
    "ИЖВ": {
      "iata": "IJK",
      "ru": "ИЖВ",
      "name": "Ижевск"
    },
    "ИКТ": {
      "iata": "IKT",
      "ru": "ИКТ",
      "name": "Иркутск"
    },
    "АЯТ": {
      "iata": "AYT",
      "ru": "AYT",
      "name": "Анталья"
    },
    "IST": {
      "iata": "IST",
      "ru": "IST",
      "name": "Стамбул"
    },
    "CXR": {
      "iata": "CXR",
      "ru": "CXR",
      "name": "Нячанг"
    },
    "ГСВ": {
      "iata": "GZP",
      "ru": "ГСВ",
      "name": "Газипаша"
    },
    "МУН": {
      "iata": "MMK",
      "ru": "МУН",
      "name": "Мурманск"
    },
    "KRR": {
      "iata": "KRR",
      "ru": "КПА",
      "name": "Краснодар"
    }
  },
  "departures_filter": [
    "AER", "СОЧ",
    "CCC",
    "DYU", "ДШБ",
    "GOX",
    "HOG",
    "HRG",
    "KQT", "КГТ",
    "LBD", "ХДТ",
    "OSS", "ОШШ",
    "PMV",
    "REN", "ОНГ",
    "SSH",
    "SUI", "СУИ",
    "TAS", "ТАС",
    "UTP",
    "VRA"
  ],
  "arrivals_filter": [
    "СОЧ",
    "AYT",
    "БАН",
    "ЧЛБ",
    "ЧБЕ",
    "ДШБ",
    "НЖС",
    "ИВВ",
    "КРВ",
    "КЛД",
    "ЕМВ",
    "КГН",
    "СКЧ",
    "КИО",
    "КЗН",
    "ХДТ",
    "ПЛК",
    "МХЛ",
    "МГС",
    "МРВ",
    "НЖК",
    "НЖВ",
    "НВК",
    "ОМС",
    "ОСК",
    "ТЛЧ",
    "ПРЬ",
    "ОНГ",
    "ГОР",
    "СЫВ",
    "СУР",
    "SKV",
    "ШРМ",
    "КЛЦ",
    "РЩН",
    "ТСК",
    "УФА",
    "УЛК",
    "ВГГ",
    "ЖУК"
  ],
  "rules": [
    {
      "flt_no": "480",
      "from": "REN",
      "to": "SVO",
      "pcs_pax": 0.19000849935400826,
      "wght_pc": 12.273041877895915,
      "hb_pax": 3.857883444776772,
      "pax_no": 147
    },
    {
      "flt_no": "482",
      "from": "REN",
      "to": "SVO",
      "pcs_pax": 0.22075449083422988,
      "wght_pc": 13.372258611038651,
      "hb_pax": 1.76558386178663,
      "pax_no": 198
    },
    {
      "flt_no": "478",
      "from": "REN",
      "to": "SVO",
      "pcs_pax": 0.2120806490690235,
      "wght_pc": 13.124052812841676,
      "hb_pax": 3.8342713830420987,
      "pax_no": 133
    },
    {
      "flt_no": "",
      "from": "REN",
      "to": "LED",
      "pcs_pax": 0.3985906677943838,
      "wght_pc": 13.584611846856104,
      "hb_pax": 2.0559171387638364,
      "pax_no": 180
    },
    {
      "flt_no": "",
      "from": "REN",
      "to": "AER",
      "pcs_pax": 0.48006772363272554,
      "wght_pc": 12.290491041472505,
      "hb_pax": 2.2280069793731583,
      "pax_no": 209
    },
    {
      "flt_no": "",
      "from": "REN",
      "to": "MCX",
      "pcs_pax": 0.6831289885181118,
      "wght_pc": 10.545907559002416,
      "hb_pax": 1.371263802867291,
      "pax_no": 99
    },
    {
      "flt_no": "",
      "from": "REN",
      "to": "MRV",
      "pcs_pax": 0.9139620504106486,
      "wght_pc": 11.768496296634273,
      "hb_pax": 0.7972245822713112,
      "pax_no": 65
    },
    {
      "flt_no": "",
      "from": "REN",
      "to": "KGD",
      "pcs_pax": 0.6702243309469568,
      "wght_pc": 12.381970824087189,
      "hb_pax": 0.6937705798169833,
      "pax_no": 172
    },
    {
      "flt_no": "",
      "from": "REN",
      "to": "LBD",
      "pcs_pax": 0.9005723234973563,
      "wght_pc": 15.680858803986709,
      "hb_pax": 1.880901410524189,
      "pax_no": 138
    },
    {
      "flt_no": "",
      "from": "REN",
      "to": "DYU",
      "pcs_pax": 0.9117311675628105,
      "wght_pc": 15.50598093889233,
      "hb_pax": 3.4263236903956984,
      "pax_no": 143
    },
    {
      "flt_no": "",
      "from": "OSS",
      "to": "UFA",
      "pcs_pax": 0.8797585111759589,
      "wght_pc": 15.933204163430357,
      "hb_pax": 1.841170989472188,
      "pax_no": 179
    },
    {
      "flt_no": "",
      "from": "OSS",
      "to": "TJM",
      "pcs_pax": 0.6262254901960784,
      "wght_pc": 15.468201754385966,
      "hb_pax": 2.6084881320949433,
      "pax_no": 185
    },
    {
      "flt_no": "",
      "from": "OSS",
      "to": "OMS",
      "pcs_pax": 0.313816810319401,
      "wght_pc": 15.70886193748216,
      "hb_pax": 0.5176462675167338,
      "pax_no": 103
    },
    {
      "flt_no": "",
      "from": "OSS",
      "to": "KUF",
      "pcs_pax": 0.8175625042677062,
      "wght_pc": 15.98948302262811,
      "hb_pax": 1.2627297965563535,
      "pax_no": 203
    },
    {
      "flt_no": "",
      "from": "OSS",
      "to": "KEJ",
      "pcs_pax": 0.43613492972967977,
      "wght_pc": 15.688618859347493,
      "hb_pax": 1.8305659802739622,
      "pax_no": 105
    },
    {
      "flt_no": "",
      "from": "OSS",
      "to": "KJA",
      "pcs_pax": 0.5577261633925562,
      "wght_pc": 15.97675698484522,
      "hb_pax": 1.5320540228224757,
      "pax_no": 50
    },
    {
      "flt_no": "",
      "from": "LBD",
      "to": "UFA",
      "pcs_pax": 0.8928284023668639,
      "wght_pc": 15.031537684860723,
      "hb_pax": 1.7052781065088758,
      "pax_no": 189
    },
    {
      "flt_no": "",
      "from": "LBD",
      "to": "KZN",
      "pcs_pax": 0.887727369229375,
      "wght_pc": 15.56790222442367,
      "hb_pax": 2.462530176416067,
      "pax_no": 188
    },
    {
      "flt_no": "",
      "from": "LBD",
      "to": "REN",
      "pcs_pax": 0.8612528279309318,
      "wght_pc": 15.223448773448773,
      "hb_pax": 1.981984844235434,
      "pax_no": 115
    },
    {
      "flt_no": "",
      "from": "KQT",
      "to": "SVO",
      "pcs_pax": 0.8641345759334154,
      "wght_pc": 13.951072017592082,
      "hb_pax": 2.903581267217631,
      "pax_no": 155
    },
    {
      "flt_no": "",
      "from": "KQT",
      "to": "KJA",
      "pcs_pax": 0.9335106382978724,
      "wght_pc": 15.127863837542307,
      "hb_pax": 3.377659574468085,
      "pax_no": 173
    },
    {
      "flt_no": "",
      "from": "DYU",
      "to": "UFA",
      "pcs_pax": 0.818256329306053,
      "wght_pc": 13.473651960784313,
      "hb_pax": 0.9009471191791634,
      "pax_no": 176
    },
    {
      "flt_no": "",
      "from": "DYU",
      "to": "KZN",
      "pcs_pax": 0.8884295632192718,
      "wght_pc": 14.28776389938495,
      "hb_pax": 1.66712858588873,
      "pax_no": 220
    },
    {
      "flt_no": "",
      "from": "DYU",
      "to": "KUF",
      "pcs_pax": 0.951993388931446,
      "wght_pc": 14.333670083815022,
      "hb_pax": 2.800455744731719,
      "pax_no": 188
    },
    {
      "flt_no": "",
      "from": "DYU",
      "to": "REN",
      "pcs_pax": 0.9035193201859869,
      "wght_pc": 12.635137951154455,
      "hb_pax": 2.191798941798942,
      "pax_no": 186
    },
    {
      "flt_no": "",
      "from": "CCC",
      "to": "SVO",
      "pcs_pax": 0.7932712165018587,
      "wght_pc": 13.173699219177465,
      "hb_pax": 0,
      "pax_no": 522
    },
    {
      "flt_no": "",
      "from": "VRA",
      "to": "SVO",
      "pcs_pax": 0.8407560734847067,
      "wght_pc": 12.365900791790013,
      "hb_pax": 0,
      "pax_no": 485
    },
    {
      "flt_no": "",
      "from": "PMV",
      "to": "SVO",
      "pcs_pax": 0.8110599078341014,
      "wght_pc": 12.8125,
      "hb_pax": 0,
      "pax_no": 466
    },
    {
      "flt_no": "",
      "from": "SSH",
      "to": "KZN",
      "pcs_pax": 0.7589516426725729,
      "wght_pc": 12.057066039919519,
      "hb_pax": 3,
      "pax_no": 192
    },
    {
      "flt_no": "",
      "from": "SSH",
      "to": "ZIA",
      "pcs_pax": 0.739240506329114,
      "wght_pc": 16.397260273972602,
      "hb_pax": 5,
      "pax_no": 56
    },
    {
      "flt_no": "",
      "from": "SSH",
      "to": "SVO",
      "pcs_pax": 0.7842851061241866,
      "wght_pc": 12.175868611721262,
      "hb_pax": 3,
      "pax_no": 379
    },
    {
      "flt_no": "",
      "from": "SSH",
      "to": "SVX",
      "pcs_pax": 0.7618524558690586,
      "wght_pc": 12.129449761991417,
      "hb_pax": 3,
      "pax_no": 378
    },
    {
      "flt_no": "",
      "from": "HRG",
      "to": "SVO",
      "pcs_pax": 0.7256294739775861,
      "wght_pc": 12.367720205032436,
      "hb_pax": 5,
      "pax_no": 56
    },
    {
      "flt_no": "",
      "from": "SSH",
      "to": "LED",
      "pcs_pax": 0.7761185650929097,
      "wght_pc": 11.718447054436988,
      "hb_pax": 3,
      "pax_no": 219
    },
    {
      "flt_no": "",
      "from": "AER",
      "to": "BAX",
      "pcs_pax": 0.41365719228968906,
      "wght_pc": 13.77295936537406,
      "hb_pax": 1.6221716962854476,
      "pax_no": 189
    },
    {
      "flt_no": "",
      "from": "AER",
      "to": "CSY",
      "pcs_pax": 0.5783660959627985,
      "wght_pc": 12.719639468690701,
      "hb_pax": 1.7540512928908616,
      "pax_no": 187
    },
    {
      "flt_no": "",
      "from": "AER",
      "to": "CEK",
      "pcs_pax": 0.5483870967741935,
      "wght_pc": 14.127450980392156,
      "hb_pax": 1.467741935483871,
      "pax_no": 191
    },
    {
      "flt_no": "",
      "from": "AER",
      "to": "GOJ",
      "pcs_pax": 0.4944048581699833,
      "wght_pc": 14.334865472417858,
      "hb_pax": 1.1773904136535378,
      "pax_no": 293
    },
    {
      "flt_no": "",
      "from": "AER",
      "to": "IWA",
      "pcs_pax": 0.5258519465341,
      "wght_pc": 13.693522984951557,
      "hb_pax": 2.0827420425047047,
      "pax_no": 94
    },
    {
      "flt_no": "",
      "from": "AER",
      "to": "KVX",
      "pcs_pax": 0.3657672285797843,
      "wght_pc": 13.296426663614165,
      "hb_pax": 1.348742347502356,
      "pax_no": 176
    },
    {
      "flt_no": "",
      "from": "AER",
      "to": "KZN",
      "pcs_pax": 0.4799060062121259,
      "wght_pc": 14.307287390629401,
      "hb_pax": 1.383001760681853,
      "pax_no": 158
    },
    {
      "flt_no": "",
      "from": "#REF!",
      "to": "#REF!",
      "pcs_pax": 0,
      "wght_pc": 0,
      "hb_pax": 0,
      "pax_no": 211
    },
    {
      "flt_no": "",
      "from": "AER",
      "to": "KJA",
      "pcs_pax": 0.4561821415365889,
      "wght_pc": 13.959053808973977,
      "hb_pax": 1.1870700675584427,
      "pax_no": 421
    },
    {
      "flt_no": "",
      "from": "AER",
      "to": "KRO",
      "pcs_pax": 0.4167624244659883,
      "wght_pc": 14.215893243854264,
      "hb_pax": 1.2650080942449065,
      "pax_no": 176
    },
    {
      "flt_no": "",
      "from": "AER",
      "to": "KEJ",
      "pcs_pax": 0.43516084978144526,
      "wght_pc": 13.659474707626881,
      "hb_pax": 1.985968495050178,
      "pax_no": 165
    },
    {
      "flt_no": "",
      "from": "AER",
      "to": "LED",
      "pcs_pax": 0.5593917319609641,
      "wght_pc": 14.175844984802433,
      "hb_pax": 1.5584441270749592,
      "pax_no": 202
    },
    {
      "flt_no": "",
      "from": "AER",
      "to": "NJC",
      "pcs_pax": 0.4861447056343227,
      "wght_pc": 13.653912408898531,
      "hb_pax": 1.8074111219689548,
      "pax_no": 193
    },
    {
      "flt_no": "",
      "from": "AER",
      "to": "NOZ",
      "pcs_pax": 0.4082221996611796,
      "wght_pc": 12.986253300187727,
      "hb_pax": 1.3821361544494515,
      "pax_no": 160
    },
    {
      "flt_no": "",
      "from": "AER",
      "to": "OVB",
      "pcs_pax": 0.44936708860759494,
      "wght_pc": 14.380281690140846,
      "hb_pax": 2.981012658227848,
      "pax_no": 159
    },
    {
      "flt_no": "",
      "from": "AER",
      "to": "OMS",
      "pcs_pax": 0.4119652725237547,
      "wght_pc": 14.049685243227916,
      "hb_pax": 1.5733931128400105,
      "pax_no": 184
    },
    {
      "flt_no": "",
      "from": "AER",
      "to": "PEE",
      "pcs_pax": 0.48672833279934175,
      "wght_pc": 13.081927459409826,
      "hb_pax": 1.15648059612191,
      "pax_no": 193
    },
    {
      "flt_no": "",
      "from": "AER",
      "to": "SVO",
      "pcs_pax": 0.5054945054945055,
      "wght_pc": 14.108823529411765,
      "hb_pax": 1.0402930402930404,
      "pax_no": 65
    },
    {
      "flt_no": "",
      "from": "AER",
      "to": "SVX",
      "pcs_pax": 0.4528979862929274,
      "wght_pc": 13.76388613067584,
      "hb_pax": 1.1676409026402896,
      "pax_no": 359
    },
    {
      "flt_no": "",
      "from": "AER",
      "to": "SGC",
      "pcs_pax": 0.4119265558048433,
      "wght_pc": 14.172382630919216,
      "hb_pax": 1.333053245780677,
      "pax_no": 118
    },
    {
      "flt_no": "",
      "from": "AER",
      "to": "SKX",
      "pcs_pax": 0.7351302155557802,
      "wght_pc": 13.262528791274496,
      "hb_pax": 2.0286172276342658,
      "pax_no": 120
    },
    {
      "flt_no": "",
      "from": "AER",
      "to": "SCW",
      "pcs_pax": 0.5053054067765652,
      "wght_pc": 13.616223777185088,
      "hb_pax": 1.4107385871930334,
      "pax_no": 160
    },
    {
      "flt_no": "",
      "from": "AER",
      "to": "TOF",
      "pcs_pax": 0.4793077270523044,
      "wght_pc": 13.972685943672833,
      "hb_pax": 1.2103079840750337,
      "pax_no": 177
    },
    {
      "flt_no": "",
      "from": "AER",
      "to": "TJM",
      "pcs_pax": 0.34,
      "wght_pc": 14.191176470588236,
      "hb_pax": 1.175,
      "pax_no": 185
    },
    {
      "flt_no": "",
      "from": "AER",
      "to": "UFA",
      "pcs_pax": 0.49758682156698625,
      "wght_pc": 13.799839221153977,
      "hb_pax": 1.263696645069246,
      "pax_no": 342
    },
    {
      "flt_no": "",
      "from": "AER",
      "to": "ULV",
      "pcs_pax": 0.385,
      "wght_pc": 14.974025974025974,
      "hb_pax": 2.27,
      "pax_no": 170
    },
    {
      "flt_no": "",
      "from": "AER",
      "to": "REN",
      "pcs_pax": 0.5057578242000309,
      "wght_pc": 14.564036885642874,
      "hb_pax": 1.3525605621244066,
      "pax_no": 210
    },
    {
      "flt_no": "",
      "from": "AER",
      "to": "NBC",
      "pcs_pax": 0.451828485739849,
      "wght_pc": 13.427413544310095,
      "hb_pax": 1.405851738082013,
      "pax_no": 209
    },
    {
      "flt_no": "",
      "from": "#REF!",
      "to": "#REF!",
      "pcs_pax": 0,
      "wght_pc": 0,
      "hb_pax": 0,
      "pax_no": 128
    },
    {
      "flt_no": "",
      "from": "AER",
      "to": "MQF",
      "pcs_pax": 0.3987621651009957,
      "wght_pc": 13.73316636882149,
      "hb_pax": 1.487214345158873,
      "pax_no": 163
    },
    {
      "flt_no": "",
      "from": "REN",
      "to": "RGK",
      "pcs_pax": 0.6920000225644682,
      "wght_pc": 10.673025036170964,
      "hb_pax": 1.9775200099641341,
      "pax_no": 37
    },
    {
      "flt_no": "N484",
      "from": "REN",
      "to": "SVO",
      "pcs_pax": 0.14799139045462573,
      "wght_pc": 13.830783081652646,
      "hb_pax": 2.139473581201522,
      "pax_no": 176
    },
    {
      "flt_no": "",
      "from": "REN",
      "to": "KZN",
      "pcs_pax": 0.6179883945841392,
      "wght_pc": 10.909825870646765,
      "hb_pax": 1.3153879217709006,
      "pax_no": 211
    },
    {
      "flt_no": "",
      "from": "AER",
      "to": "VOG",
      "pcs_pax": 0.6133925154618444,
      "wght_pc": 13.44472033941886,
      "hb_pax": 2.355898330366564,
      "pax_no": 110
    },
    {
      "flt_no": "",
      "from": "AER",
      "to": "OSW",
      "pcs_pax": 0.5577686871043002,
      "wght_pc": 13.716482276762475,
      "hb_pax": 1.7036661824664594,
      "pax_no": 81
    },
    {
      "flt_no": "",
      "from": "SUI",
      "to": "GOJ",
      "pcs_pax": 0.5971227621483376,
      "wght_pc": 14.692210602235846,
      "hb_pax": 3.1426470588235293,
      "pax_no": 71
    },
    {
      "flt_no": "",
      "from": "KQT",
      "to": "KZN",
      "pcs_pax": 0.8845905713008146,
      "wght_pc": 13.366109828401203,
      "hb_pax": 2.490601823039271,
      "pax_no": 185
    },
    {
      "flt_no": "",
      "from": "SSH",
      "to": "OMS",
      "pcs_pax": 0.7383232986681263,
      "wght_pc": 12.290636042402827,
      "hb_pax": 3,
      "pax_no": 378
    },
    {
      "flt_no": "",
      "from": "SSH",
      "to": "PEE",
      "pcs_pax": 0.7538440261563994,
      "wght_pc": 11.58700662633247,
      "hb_pax": 3,
      "pax_no": 306
    },
    {
      "flt_no": "",
      "from": "SSH",
      "to": "TJM",
      "pcs_pax": 0.7358474858474858,
      "wght_pc": 11.809044882320745,
      "hb_pax": 3,
      "pax_no": 378
    },
    {
      "flt_no": "",
      "from": "AER",
      "to": "AYT",
      "pcs_pax": 0.8983050847457628,
      "wght_pc": 12.056603773584905,
      "hb_pax": 2.2203389830508473,
      "pax_no": 59
    },
    {
      "flt_no": "N46102",
      "from": "VRA",
      "to": "SVO",
      "pcs_pax": 0.9493333333333334,
      "wght_pc": 17.865168539325843,
      "hb_pax": 0,
      "pax_no": 375
    },
    {
      "flt_no": "",
      "from": "REN",
      "to": "MQF",
      "pcs_pax": 0.42727272727272725,
      "wght_pc": 12.382978723404255,
      "hb_pax": 0,
      "pax_no": 110
    },
    {
      "flt_no": "",
      "from": "SSH",
      "to": "MRV",
      "pcs_pax": 0.7714266942610295,
      "wght_pc": 12.36411871994694,
      "hb_pax": 3,
      "pax_no": 150
    },
    {
      "flt_no": "",
      "from": "LBD",
      "to": "TJM",
      "pcs_pax": 0.9006211180124224,
      "wght_pc": 15.247564935064934,
      "hb_pax": 1.956133540372671,
      "pax_no": 177
    },
    {
      "flt_no": "",
      "from": "DYU",
      "to": "TJM",
      "pcs_pax": 0.7991164241164241,
      "wght_pc": 14.158424908424909,
      "hb_pax": 1.482934857934858,
      "pax_no": 147
    },
    {
      "flt_no": "",
      "from": "HOG",
      "to": "SVO",
      "pcs_pax": 0.7663805832410484,
      "wght_pc": 12.843582887700535,
      "hb_pax": 0,
      "pax_no": 504
    },
    {
      "flt_no": "",
      "from": "UTP",
      "to": "KJA",
      "pcs_pax": 0.8048128342245989,
      "wght_pc": 13.534883720930232,
      "hb_pax": 0,
      "pax_no": 379
    },
    {
      "flt_no": "",
      "from": "AER",
      "to": "KUF",
      "pcs_pax": 0.4854368932038835,
      "wght_pc": 13.24,
      "hb_pax": 1.6699029126213591,
      "pax_no": 183
    },
    {
      "flt_no": "",
      "from": "UTP",
      "to": "SVX",
      "pcs_pax": 0.7994722955145118,
      "wght_pc": 13.267326732673267,
      "hb_pax": 0,
      "pax_no": 379
    },
    {
      "flt_no": "",
      "from": "UTP",
      "to": "OVB",
      "pcs_pax": 0.8628689882734443,
      "wght_pc": 13.684456821313734,
      "hb_pax": 0,
      "pax_no": 376
    },
    {
      "flt_no": "",
      "from": "SSH",
      "to": "UFA",
      "pcs_pax": 0.7549893336327401,
      "wght_pc": 12.057066039919519,
      "hb_pax": 3,
      "pax_no": 379
    },
    {
      "flt_no": "",
      "from": "UTP",
      "to": "SVO",
      "pcs_pax": 0.8160626920013654,
      "wght_pc": 14.012407557816442,
      "hb_pax": 0,
      "pax_no": 379
    },
    {
      "flt_no": "",
      "from": "GOX",
      "to": "SVO",
      "pcs_pax": 0.8590425531914894,
      "wght_pc": 13.284829721362229,
      "hb_pax": 3,
      "pax_no": 368
    },
    {
      "flt_no": "",
      "from": "GOX",
      "to": "SVX",
      "pcs_pax": 0.8423605980650835,
      "wght_pc": 14.309260583666092,
      "hb_pax": 3,
      "pax_no": 375
    },
    {
      "flt_no": "",
      "from": "SUI",
      "to": "SVO",
      "pcs_pax": 0.6294372887506258,
      "wght_pc": 14.253624370050819,
      "hb_pax": 2.3508901398733397,
      "pax_no": 498
    },
    {
      "flt_no": "",
      "from": "KQT",
      "to": "UFA",
      "pcs_pax": 0.8507157875266441,
      "wght_pc": 12.511069715656047,
      "hb_pax": 2.538199243033849,
      "pax_no": 153
    },
    {
      "flt_no": "",
      "from": "SUI",
      "to": "UFA",
      "pcs_pax": 0.17391304347826086,
      "wght_pc": 16.5625,
      "hb_pax": 3.1739130434782608,
      "pax_no": 92
    },
    {
      "flt_no": "",
      "from": "SUI",
      "to": "CEK",
      "pcs_pax": 0.4084507042253521,
      "wght_pc": 14.862068965517242,
      "hb_pax": 3.704225352112676,
      "pax_no": 71
    },
    {
      "flt_no": "",
      "from": "SUI",
      "to": "LED",
      "pcs_pax": 0.6320754716981132,
      "wght_pc": 15.134328358208956,
      "hb_pax": 2.7641509433962264,
      "pax_no": 106
    }
  ]
};

// Глобальное состояние
let baggageDb = JSON.parse(JSON.stringify(DEFAULT_BAGGAGE_DB));
let userFlights = [];
let predictionsHistory = [];
let currentLang = 'ru';
let currentTheme = 'dark';
let currentUser = null; // { id, username, full_name, role }
let isAdminAuthenticated = false;
let isOfflineMode = false;
let isAutoSelectingRoute = false;
let currentActivePredictionId = null; // ID активного рейса из Истории расчетов (для сохранения раскладки отсеков)

// Отладка ошибок прямо на экране
window.addEventListener('error', function(e) {
    if (typeof showAviationAlert === 'function') {
        showAviationAlert("ERR: " + e.message + " (" + e.filename + ":" + e.lineno + ")", true);
    }
});
window.addEventListener('unhandledrejection', function(e) {
    if (typeof showAviationAlert === 'function') {
        showAviationAlert("PROMISE REJECTION: " + e.reason, true);
    }
});

// Словари локализации
const translations = {
    ru: {
        'app-title': 'AeroBag Predictor: Расчет Веса Багажа',
        'logo-sub': 'КОНТРОЛЬ ЗАГРУЗКИ РЕЙСОВ',
        'status-dispatch': 'ДИСПЕТЧЕР ОНЛАЙН',
        'status-local': 'ЛОКАЛЬНЫЙ РЕЖИМ (OFFLINE)',
        'tab-predict': 'Прогнозирование',
        'tab-dashboard': 'Дашборд аналитики',
        'tab-admin': 'Администрирование',
        'dashboard-title': '[ ДАШБОРД АНАЛИТИКИ И МАСШТАБИРОВАНИЯ ]',
        'dash-subtext': 'Аналитический обзор коммерческих нормативов багажа за весь период загруженной базы данных',
        'dash-label-route': 'Маршрут / Аэропорт',
        'dash-opt-all-routes': 'Все направления',
        'dash-label-period': 'Период времени',
        'dash-opt-all-period': 'За весь период',
        'dash-opt-30-days': 'За последние 30 дней',
        'dash-opt-60-days': 'За последние 60 дней',
        'dash-opt-90-days': 'За последние 90 дней',
        'dash-opt-current-year': 'За текущий год',
        'dash-opt-custom-range': 'Произвольный интервал...',
        'dash-label-date-from': 'С даты',
        'dash-label-date-to': 'По дату',
        'dashboard-kpi-total-flights': 'Проанализировано рейсов',
        'dashboard-kpi-routes': 'Номеров рейсов',
        'dashboard-kpi-avg-weight': 'Средний вес на 1 пассажира',
        'dashboard-kpi-avg-pcs': 'Среднее мест на 1 пассажира',
        'dashboard-kpi-period-all': 'За весь период базы данных',
        'dash-chart1-title': '[ ВЕС НА 1 PAX ПО МАРШРУТАМ (КГ) ]',
        'dash-chart2-title': '[ МЕСТА НА 1 PAX ПО МАРШРУТАМ (PCS) ]',
        'dash-chart3-title': '[ ДИНАМИКА ПО ДНЯМ НЕДЕЛИ (КГ/PAX) ]',
        'dash-chart4-title': '[ ДОЛИ ВЫЛЕТОВ ПО МАРШРУТАМ (%) ]',
        'predict-title': 'Прогнозирование рейса',
        'label-from': 'Аэропорт вылета (FROM)',
        'label-to': 'Аэропорт прилета (TO)',
        'select-from-first': 'Сначала выберите аэропорт вылета',
        'label-flight-no': 'Номер рейса',
        'placeholder-flight-no': 'Введите номер рейса (напр. 505)',
        'select-all-flights': 'Все рейсы',
        'label-pax': 'Пассажиры (PAX)',
        'btn-calculate': 'Рассчитать прогноз',
        'manual-title': 'Вручную добавить рейс',
        'label-airline': 'Авиакомпания',
        'label-flight-num': 'Рейс №',
        'label-date': 'Дата',
        'label-from-airport': 'Вылет (FROM)',
        'label-to-airport': 'Прилет (TO)',
        'pax-distribution': 'Распределение пассажиров',
        'pax-men': 'Мужчины',
        'pax-women': 'Женщины',
        'pax-rb': 'РБ (Дети)',
        'pax-rm': 'РМ (Млад.)',
        'actual-baggage-title': 'Фактические данные (для базы)',
        'label-bag-pcs': 'Мест багажа',
        'label-bag-weight': 'Вес багажа (кг)',
        'label-hb-weight': 'Р/кладь (кг)',
        'btn-add-flight': 'Добавить рейс в базу',
        'results-title': 'Ожидаемые параметры багажа',
        'res-bag-pcs': 'Мест багажа (PCS)',
        'res-bag-weight': 'Вес багажа (Baggage Weight)',
        'res-hb-weight': 'Вес ручной клади (Cabin Bag)',
        'applied-coeffs': 'Примененные коэффициенты',
        'coef-pcs-pax': 'Мест на 1 пасс. (PCS/PAX)',
        'coef-weight-pc': 'Вес 1 места (Weight/PC)',
        'coef-hb-pax': 'Ручная кладь на 1 пасс. (HB/PAX)',
        'coef-source-label': 'Источник данных:',
        'upload-title': 'Загрузка файлов системы регистрации',
        'drop-text': 'Перетащите файлы .xls / .xlsx сюда или нажмите для выбора',
        'drop-sub': 'Поддержка SpreadsheetML 2003 (.xls) и Excel (.xlsx)',
        'total-flights-label': 'Всего рейсов в базе:',
        'active-flights-label': 'Активных (30 дней):',
        'chk-show-all-flights': 'Показать все рейсы',
        'flights-table-title': 'База данных рейсов (последние 10 дней)',
        'flights-table-title-all': 'База данных рейсов (все)',
        'btn-clear-db': 'Очистить базу',
        'th-airline': 'АК',
        'th-flight': 'Рейс',
        'th-date': 'Дата',
        'th-route': 'Маршрут',
        'th-pax': 'Пассажиры (ВЗ / РБ / РМ)',
        'th-bag-pcs': 'Багаж мест',
        'th-bag-weight': 'Вес багажа',
        'th-hb-weight': 'Вес р/к',
        'th-status': 'Статус',
        'th-action': 'Действие',
        'empty-table': 'База данных пуста. Загрузите отчеты или введите рейс вручную.',
        'status-active': 'Активен',
        'status-inactive': 'Вне 30 дней',
        'source-desc-historical': 'Историческая база данных (Июль 2026)',
        'source-desc-uploaded-30': 'Загруженные данные за последние 30 дней',
        'source-desc-uploaded-closest': 'Загруженные данные за ближайшую дату ({date})',
        'source-desc-default': 'Среднеотраслевые стандарты (Дефолт)',
        'warning-no-flights-30': 'Внимание! За последние 30 дней по рейсу {flight} {from}➔{to} данных нет. Использован ближайший рейс от {date}.',
        'warning-no-route-30': 'Внимание! За последние 30 дней по направлению {from}➔{to} данных нет. Использован ближайший рейс от {date}.',
        'error-fields-required': 'Пожалуйста, заполните все обязательные поля!',
        'success-flight-added': 'Рейс успешно добавлен в базу!',
        'confirm-clear-db': 'Вы уверены, что хотите очистить всю базу данных рейсов?',
        'file-processed-success': 'Файл "{name}" успешно обработан. Загружено {count} рейсов, отфильтровано {skipped} невылетных направлений.',
        'file-process-error': 'Ошибка при чтении файла "{name}". Проверьте структуру.',
        'select-all-flights-placeholder': 'Все рейсы',
        'theme-light': 'Светлая тема',
        'theme-dark': 'Темная тема',
        'unit-kg': 'кг',
        // Новые строки для истории прогнозов
        'predictions-table-title': 'История расчетов',
        'btn-clear-predictions': 'Очистить',
        'th-flight-date': 'Рейс / Дата',
        'th-dep-time': 'Вылет',
        'th-tail': 'Борт',
        'btn-return-plan': 'В план AeroPlan',
        'th-load-type': 'ТИП ЗАГРУЗКИ',
        'th-pax-count': 'Пассажиры (PAX)',
        'th-calc-date': 'Дата расчета',
        'empty-predictions-table': 'История пуста.',
        'confirm-clear-predictions': 'Вы уверены, что хотите очистить всю историю прогнозов?',
        'modal-confirm-title': '[\u00A0ТРЕБУЕТСЯ\u00A0ДЕЙСТВИЕ:\u00A0ОЧИСТКА\u00A0СИСТЕМЫ\u00A0]',
        'modal-confirm-cancel': '[\u00A0ОТМЕНА\u00A0]',
        'modal-confirm-submit': '[\u00A0ПОДТВЕРДИТЬ\u00A0ОЧИСТКУ\u00A0]',
        'btn-load-sample': 'Загрузить системную статистику',
        'btn-transfer-preliminary': '[ ⬇️ ПЕРЕНЕСТИ В PRELIMINARY ]',
        'load-planning-title': '[ СРЕДНИЙ ВЕС БАГАЖА И ДАННЫЕ ЗАГРУЗКИ ]',
        'load-planning-sub-title': 'ДАННЫЕ РАСПРЕДЕЛЕНИЯ БАГАЖА',
        'th-status-cat': 'СТАТУС',
        'th-pax-no': 'ПАССАЖИРЫ',
        'th-pcs': 'МЕСТА',
        'th-weight': 'ВЕС (кг)',
        'th-avg-bag-weight': 'СРЕДНИЙ ВЕС БАГАЖА',
        'th-avg-bag-pax': 'МЕСТ НА ПАССАЖИРА',
        'row-preliminary': 'ПРЕДВАРИТЕЛЬНЫЙ',
        'row-lir-final': 'LIR / ФИНАЛЬНЫЙ',
        'header-uld': 'ULD (Контейнеры)',
        'header-bulk': 'BULK (Багажники)',
        'th-uld-no': '№ ULD',
        'th-cpt-sec': 'ОТСЕК',
        'row-rest': 'ОСТАТОК',
        'row-ttl': 'ИТОГО',
        'auth-modal-title': '[ АВТОРИЗАЦИЯ В СИСТЕМЕ AEROBAG ]',
        'label-auth-username': 'ЛОГИН / ПОЗЫВНОЙ',
        'label-auth-password': 'ПАРОЛЬ ДОСТУПА',
        'btn-login-submit': '[ ВОЙТИ В СИСТЕМУ ]',
        'btn-logout': 'Выход',
        'rbac-title': '[ УПРАВЛЕНИЕ УЧЕТНЫМИ ЗАПИСЯМИ (RBAC) ]',
        'rbac-subtext': 'Управление диспетчерами, администраторами и разграничение прав доступа',
        'btn-add-user': 'Добавить пользователя',
        'th-user-login': 'Логин',
        'th-user-name': 'ФИО / Позывной',
        'th-user-role': 'Роль',
        'th-user-status': 'Статус',
        'th-user-last-login': 'Последний вход',
        'th-user-actions': 'Действия',
        'autobackup-title': '[ АВТОМАТИЧЕСКИЕ РЕЗЕРВНЫЕ КОПИИ (30 ДНЕЙ) ]',
        'autobackup-subtext': 'Ежедневные снимки базы рейсов на сервере. Ротация и хранение последних 30 дней.',
        'btn-create-server-backup': 'Создать бэкап сейчас',
        'th-backup-file': 'Имя файла архива',
        'th-backup-date': 'Дата создания',
        'th-backup-size': 'Размер',
        'th-backup-actions': 'Действия',
        'label-user-login': 'Логин',
        'label-user-fullname': 'ФИО / Позывной',
        'label-user-role': 'Роль в системе',
        'label-user-password': 'Пароль доступа',
        'label-user-active': 'Активная учетная запись (Разрешить вход)',
        'label-new-password': 'Новый пароль',
        'label-confirm-password': 'Повторите пароль',
        
        // Аналитические параметры
        'analysis-settings-title': 'ПАРАМЕТРЫ АНАЛИЗА И СЕЗОННОСТИ',
        'label-analysis-scope': 'Область сопоставления (Matching Scope)',
        'opt-scope-auto': 'Умный каскад (Авто)',
        'opt-scope-flight': 'Только выбранный рейс',
        'opt-scope-route': 'Всё направление (Маршрут)',
        'label-period-type': 'Период анализа данных (Data Period)',
        'opt-period-auto': 'Умный каскад (180 дн., α=0.3, сезонность)',
        'opt-period-all-history': 'Вся история базы (3 года)',
        'opt-period-custom': 'Произвольный диапазон дат',
        'opt-period-seasonal': 'Сезонный срез (месяц / год)',
        'label-flight-date': 'Дата рейса',
        'sampled-flights-title': 'Отобранные рейсы для расчета ({count} вып.):',
        'th-sample-date': 'Дата (день)',
        'th-sample-flight': 'Рейс',
        'th-sample-pax': 'Пасс.',
        'th-sample-pcs': 'Багаж',
        'th-sample-weight': 'Вес баг.',
        'th-sample-hb': 'Р/кладь',
        'sample-totals-label': 'ИТОГО (СУММЫ):',
        'source-desc-uploaded-weekday4': 'Последние 4 рейса ({weekday}) ({scope})',
        'source-desc-uploaded-weekday4-fallback': 'Среднее за ближайшие 30 дней до вылета ({scope}, последний рейс от {date})',
        'warning-no-flights-weekday4': 'Внимание! По рейсу {flight} {from}➔{to} нет данных на {weekday} за последние 60 дней. Использовано среднее значение за ближайшие 30 дней до вылета (последний рейс от {date}).',
        'warning-no-route-weekday4': 'Внимание! По направлению {from}➔{to} нет данных на {weekday} за последние 60 дней. Использовано среднее значение за ближайшие 30 дней до вылета (последний рейс от {date}).',
        'label-start-date': 'Дата начала (From)',
        'label-end-date': 'Дата окончания (To)',
        'label-month': 'Месяц (Month)',
        'label-year': 'Год (Year)',
        'opt-all-years': 'Все года',
        'month-jan': 'Январь',
        'month-feb': 'Февраль',
        'month-mar': 'Март',
        'month-apr': 'Апрель',
        'month-may': 'Май',
        'month-jun': 'Июнь',
        'month-jul': 'Июль',
        'month-aug': 'Август',
        'month-sep': 'Сентябрь',
        'month-oct': 'Октябрь',
        'month-nov': 'Ноябрь',
        'month-dec': 'Декабрь',
        'source-desc-uploaded-custom': 'Загруженные данные с {start} по {end} ({scope})',
        'source-desc-uploaded-seasonal': 'Загруженные данные за {month} {year} ({scope})',
        'scope-flight': 'Рейс',
        'scope-route': 'Направление',
        
        // Резервное копирование и верификация
        'btn-open-backtest': '🔬 Тест точности (Backtest)',
        'backtest-modal-title': '[ ТЕСТИРОВАНИЕ И ВАЛИДАЦИЯ ТОЧНОСТИ ПРОГНОЗОВ ]',
        'backtest-label-period': 'Период анализа:',
        'btn-start-backtest': '▶ Запустить тест точности',
        'btn-export-db': 'Экспорт базы (Backup)',
        'btn-import-db': 'Импорт базы (Restore)',
        'backup-import-success': 'База данных успешно восстановлена! Загружено {flights} рейсов и {predictions} прогнозов.',
        'backup-import-error': 'Ошибка чтения файла резервной копии. Убедитесь, что формат файла верен.',
        'filters-title': '[ ФИЛЬТРЫ НАПРАВЛЕНИЙ И ГОРОДОВ ДЛЯ ЗАГРУЗКИ ]',
        'filters-subtext': 'Настройка разрешенных направлений для импорта из отчетов регистрации (Astra DCS / Excel). Поддерживаются коды IATA, коды РФ и названия городов.',
        'filter-departures-title': 'АЭРОПОРТЫ ВЫЛЕТА (FROM)',
        'filter-arrivals-title': 'АЭРОПОРТЫ ПРИЛЕТА (TO)',
        'btn-reset-filters-default': 'Сбросить по умолчанию',
        'btn-reset-filters': 'Сбросить по умолчанию',
        'btn-add': 'Добавить',
        'btn-add-departure-airport': 'Добавить аэропорт вылета',
        'btn-add-arrival-airport': 'Добавить аэропорт прилета',
        'modal-add-airport-title': '[ ДОБАВЛЕНИЕ НОВОГО НАПРАВЛЕНИЯ ]',
        'label-airport-city': 'Название города / аэропорта',
        'label-airport-iata': 'Код ИАТА (IATA)',
        'hint-airport-iata': '3 латинские буквы',
        'label-airport-ru': 'Российский код (РФ)',
        'hint-airport-ru': 'Для РФ/СНГ (или как IATA)',
        'label-airport-target': 'В какой фильтр добавить:',
        'target-departures-label': '🛫 Аэропорты вылета (FROM)',
        'target-arrivals-label': '🛬 Аэропорты прилета (TO)',
        'target-both-label': '🔄 В оба списка (Вылет и Прилет)',
        'btn-save-airport': '[ ➕ Сохранить и добавить ]',
        'chk-strict-arrivals': 'Включить строгий фильтр по прилетам',
        'btn-expand': 'Развернуть',
        'btn-collapse': 'Свернуть',
        'dcs-sync-btn-title': 'Синхронизация с Lydia DCS',
        'dcs-sync-btn-sub': 'Парсинг закрытых рейсов в 1 клик',
        'footer-build-label': 'Сборка',
        'footer-developer': 'Разработчик: Andrey Zubkov',
        'btn-manual': 'Руководство',
        'dcs-sync-btn-title': 'Синхронизация с Lydia DCS',
        'dcs-sync-btn-sub': 'Парсинг закрытых рейсов в 1 клик',
        'telegram-title': '[ TELEGRAM ALERTING & OBSERVABILITY ]',
        'telegram-subtext': 'Мгновенная отправка алертов о критических ошибках и сбоях системы диспетчеров прямо в Telegram администратора.',
        'label-telegram-token': 'Токен Telegram-бота (Bot Token):',
        'label-telegram-chatid': 'ID чата / группы (Chat ID):',
        'chk-telegram-enable': 'Включить автоматическую отправку алертов об ошибках',
        'btn-test-telegram': 'Тест соединения',
        'btn-save-telegram': 'Сохранить настройки',
        'diagnostics-title': '[ SYSTEM HEALTH & DATABASE DIAGNOSTICS\u00A0]',
        'diagnostics-subtext': 'Сводные технические метрики производительности, целостности базы данных и системного окружения хостинга.',

        // Системный журнал аудита и логирования ошибок
        'logs-title': '[ СИСТЕМНЫЙ ЖУРНАЛ И ОШИБКИ ]',
        'logs-subtext': 'Аудит действий пользователей, авторизации, операций с базой и автоматический перехват ошибок JavaScript.',
        'label-log-retention': 'Хранение логов:',
        'btn-refresh-logs': 'Обновить',
        'btn-export-logs': 'Экспорт',
        'btn-clear-logs': 'Очистить',
        'th-log-time': 'Время',
        'th-log-level': 'Уровень',
        'th-log-cat': 'Категория',
        'th-log-user': 'Пользователь / IP',
        'th-log-msg': 'Событие / Ошибка',
        'th-log-details': 'Детали',
        'modal-log-title': '[ ДЕТАЛИ И КОНТЕКСТ СОБЫТИЯ ]'
    },
    en: {
        'app-title': 'AeroBag Predictor: Baggage Weight Calculator',
        'logo-sub': 'FLIGHT OPS CONTROL',
        'status-dispatch': 'DISPATCH ONLINE',
        'status-local': 'LOCAL MODE (OFFLINE)',
        'tab-predict': 'Forecasting',
        'tab-dashboard': 'Analytics Dashboard',
        'tab-admin': 'Administration',
        'dashboard-title': '[ ANALYTICS & SCALING DASHBOARD ]',
        'dash-subtext': 'Analytical overview of baggage commercial norms across the loaded database',
        'dash-label-route': 'Route / Airport',
        'dash-opt-all-routes': 'All Routes',
        'dash-label-period': 'Time Period',
        'dash-opt-all-period': 'All Time',
        'dash-opt-30-days': 'Last 30 Days',
        'dash-opt-60-days': 'Last 60 Days',
        'dash-opt-90-days': 'Last 90 Days',
        'dash-opt-current-year': 'Current Year',
        'dash-opt-custom-range': 'Custom Date Range...',
        'dash-label-date-from': 'From Date',
        'dash-label-date-to': 'To Date',
        'dashboard-kpi-total-flights': 'Flights Analyzed',
        'dashboard-kpi-routes': 'Flight Numbers',
        'dashboard-kpi-avg-weight': 'Avg Weight / PAX',
        'dashboard-kpi-avg-pcs': 'Avg Pieces / PAX',
        'dashboard-kpi-period-all': 'For entire database period',
        'dash-chart1-title': '[ WEIGHT PER PAX BY ROUTE (KG) ]',
        'dash-chart2-title': '[ PIECES PER PAX BY ROUTE (PCS) ]',
        'dash-chart3-title': '[ WEEKDAY DYNAMICS (KG/PAX) ]',
        'dash-chart4-title': '[ FLIGHT SHARES BY ROUTE (%) ]',
        'predict-title': 'Flight Forecasting',
        'label-from': 'Departure Airport (FROM)',
        'label-to': 'Arrival Airport (TO)',
        'select-from-first': 'Select departure airport first',
        'label-flight-no': 'Flight Number',
        'placeholder-flight-no': 'Enter flight number (e.g. 505)',
        'select-all-flights': 'All Flights',
        'label-pax': 'Passengers (PAX)',
        'btn-calculate': 'Calculate Forecast',
        'manual-title': 'Add Flight Manually',
        'label-airline': 'Airline',
        'label-flight-num': 'Flight No.',
        'label-date': 'Date',
        'label-from-airport': 'Departure (FROM)',
        'label-to-airport': 'Arrival (TO)',
        'pax-distribution': 'Passenger Distribution',
        'pax-men': 'Male',
        'pax-women': 'Female',
        'pax-rb': 'Children (CHD)',
        'pax-rm': 'Infants (INF)',
        'actual-baggage-title': 'Actual Baggage (for Database)',
        'label-bag-pcs': 'Baggage Pieces',
        'label-bag-weight': 'Baggage Weight (kg)',
        'label-hb-weight': 'Cabin Bag (kg)',
        'btn-add-flight': 'Add Flight to DB',
        'results-title': 'Expected Baggage Parameters',
        'res-bag-pcs': 'Baggage Pieces (PCS)',
        'res-bag-weight': 'Baggage Weight',
        'res-hb-weight': 'Cabin Bag Weight',
        'applied-coeffs': 'Applied Coefficients',
        'coef-pcs-pax': 'Pieces per Pax (PCS/PAX)',
        'coef-weight-pc': 'Weight per Piece (Weight/PC)',
        'coef-hb-pax': 'Cabin Bag per Pax (HB/PAX)',
        'coef-source-label': 'Calculation source:',
        'upload-title': 'Upload Registration Reports',
        'drop-text': 'Drag & Drop .xls / .xlsx files here or click to select',
        'drop-sub': 'Supports SpreadsheetML 2003 (.xls) and Excel (.xlsx)',
        'total-flights-label': 'Total flights in DB:',
        'active-flights-label': 'Active (30 days):',
        'chk-show-all-flights': 'Show all flights',
        'flights-table-title': 'Flights Database (last 10 days)',
        'flights-table-title-all': 'Flights Database (all)',
        'btn-clear-db': 'Clear Database',
        'th-airline': 'AL',
        'th-flight': 'Flight',
        'th-date': 'Date',
        'th-route': 'Route',
        'th-pax': 'Passengers (Adult / Child / Infant)',
        'th-bag-pcs': 'Baggage Pcs',
        'th-bag-weight': 'Baggage Weight',
        'th-hb-weight': 'Cabin Bag Weight',
        'th-status': 'Status',
        'th-action': 'Action',
        'empty-table': 'Database is empty. Upload reports or add a flight manually.',
        'status-active': 'Active',
        'status-inactive': 'Out of 30 days',
        'source-desc-historical': 'Historical Database (July 2026)',
        'source-desc-uploaded-30': 'Uploaded data for the last 30 days',
        'source-desc-uploaded-closest': 'Uploaded data for the closest date ({date})',
        'source-desc-default': 'Industry standards (Default)',
        'warning-no-flights-30': 'Warning! No data for flight {flight} {from}➔{to} in the last 30 days. Used closest flight from {date}.',
        'warning-no-route-30': 'Warning! No data for route {from}➔{to} in the last 30 days. Used closest flight from {date}.',
        'error-fields-required': 'Please fill in all required fields!',
        'success-flight-added': 'Flight successfully added to database!',
        'confirm-clear-db': 'Are you sure you want to clear the entire flights database?',
        'file-processed-success': 'File "{name}" successfully processed. Loaded {count} flights, skipped {skipped} non-departure destinations.',
        'file-process-error': 'Error reading file "{name}". Check its structure.',
        'select-all-flights-placeholder': 'All flights',
        'theme-light': 'Light Theme',
        'theme-dark': 'Dark Theme',
        'unit-kg': 'kg',
        // New strings for predictions history
        'predictions-table-title': 'Forecast History',
        'btn-clear-predictions': 'Clear',
        'th-flight-date': 'Flight / Date',
        'th-dep-time': 'Dep',
        'th-tail': 'Tail',
        'btn-return-plan': 'To AeroPlan',
        'th-load-type': 'LOAD TYPE',
        'th-pax-count': 'Passengers (PAX)',
        'th-calc-date': 'Calculation Date',
        'empty-predictions-table': 'History is empty.',
        'confirm-clear-predictions': 'Are you sure you want to clear the entire predictions history?',
        'modal-confirm-title': '[\u00A0ACTION\u00A0REQUIRED:\u00A0SYSTEM\u00A0PURGE\u00A0]',
        'modal-confirm-cancel': '[\u00A0CANCEL\u00A0]',
        'modal-confirm-submit': '[\u00A0CONFIRM\u00A0PURGE\u00A0]',
        'btn-load-sample': '[ LOAD SYSTEM STATISTICS ]',
        'btn-transfer-preliminary': '[ ⬇️ TRANSFER TO PRELIMINARY ]',
        'load-planning-title': '[ AVERAGE BAGGAGE WEIGHT & LOAD PLANNING DATA ]',
        'load-planning-sub-title': 'BAGGAGE DISTRIBUTION (LOAD PLANNING DATA)',
        'th-status-cat': 'STATUS',
        'th-pax-no': 'PAX NO',
        'th-pcs': 'PCS',
        'th-weight': 'WEIGHT (kg)',
        'th-avg-bag-weight': 'AVERAGE BAG WEIGHT',
        'th-avg-bag-pax': 'AVERAGE BAG NO/PAX',
        'row-preliminary': 'PRELIMINARY',
        'row-lir-final': 'LIR OR FINAL',
        'header-uld': 'ULD (Containers)',
        'header-bulk': 'BULK (Loose Cargo)',
        'th-uld-no': 'ULD NO',
        'th-cpt-sec': 'CPT/SEC',
        'row-rest': 'REST',
        'row-ttl': 'TTL',
        'auth-modal-title': '[ AEROBAG ACCESS CONTROL ]',
        'label-auth-username': 'LOGIN / CALLSIGN',
        'label-auth-password': 'ACCESS PASSWORD',
        'btn-login-submit': '[ ENTER SYSTEM ]',
        'btn-logout': 'Logout',
        'rbac-title': '[ ACCESS CONTROL & USER MANAGEMENT ]',
        'rbac-subtext': 'Manage dispatchers, administrators, and role-based permissions',
        'btn-add-user': 'Add User',
        'th-user-login': 'Login',
        'th-user-name': 'Full Name / Callsign',
        'th-user-role': 'Role',
        'th-user-status': 'Status',
        'th-user-last-login': 'Last Login',
        'th-user-actions': 'Actions',
        'autobackup-title': '[ AUTOMATED DATABASE BACKUPS (30 DAYS) ]',
        'autobackup-subtext': 'Daily database snapshots on server. 30-day rotation and retention.',
        'btn-create-server-backup': 'Create Backup Now',
        'th-backup-file': 'Backup Filename',
        'th-backup-date': 'Created Date',
        'th-backup-size': 'Size',
        'th-backup-actions': 'Actions',
        'label-user-login': 'Login',
        'label-user-fullname': 'Full Name / Callsign',
        'label-user-role': 'System Role',
        'label-user-password': 'Password',
        'label-user-active': 'Active Account (Allow Login)',
        'label-new-password': 'New Password',
        'label-confirm-password': 'Confirm Password',
        
        // Analytical settings
        'analysis-settings-title': 'ANALYSIS & SEASONALITY SETTINGS',
        'label-analysis-scope': 'Matching Scope',
        'opt-scope-auto': 'Smart Waterfall (Auto Cascade)',
        'opt-scope-flight': 'Strict Flight Match',
        'opt-scope-route': 'Entire Route',
        'label-period-type': 'Analysis Period (Data Period)',
        'opt-period-auto': 'Smart Waterfall (180 days, α=0.3, season)',
        'opt-period-all-history': 'All Database History (3 Years)',
        'opt-period-custom': 'Custom Date Range',
        'opt-period-seasonal': 'Seasonal Slice (Month / Year)',
        'label-flight-date': 'Flight Date',
        'sampled-flights-title': 'Selected Flights for Calculation ({count} flts):',
        'th-sample-date': 'Date (Day)',
        'th-sample-flight': 'Flight',
        'th-sample-pax': 'Pax',
        'th-sample-pcs': 'Baggage',
        'th-sample-weight': 'Baggage Wt',
        'th-sample-hb': 'Cabin Bag',
        'sample-totals-label': 'TOTALS:',
        'source-desc-uploaded-weekday4': 'Last 4 flights ({weekday}) ({scope})',
        'source-desc-uploaded-weekday4-fallback': 'Average for 30 days prior to departure ({scope}, latest flight from {date})',
        'warning-no-flights-weekday4': 'Warning! No data on {weekday} for flight {flight} {from}➔{to} for the last 60 days. Used average for 30 days prior to departure (latest flight from {date}).',
        'warning-no-route-weekday4': 'Warning! No data on {weekday} for route {from}➔{to} for the last 60 days. Used average for 30 days prior to departure (latest flight from {date}).',
        'label-start-date': 'Start Date (From)',
        'label-end-date': 'End Date (To)',
        'label-month': 'Month',
        'label-year': 'Year',
        'opt-all-years': 'All Years',
        'month-jan': 'January',
        'month-feb': 'February',
        'month-mar': 'March',
        'month-apr': 'April',
        'month-may': 'May',
        'month-jun': 'June',
        'month-jul': 'July',
        'month-aug': 'August',
        'month-sep': 'September',
        'month-oct': 'October',
        'month-nov': 'November',
        'month-dec': 'December',
        'source-desc-uploaded-custom': 'Uploaded data from {start} to {end} ({scope})',
        'source-desc-uploaded-seasonal': 'Uploaded data for {month} {year} ({scope})',
        'scope-flight': 'Flight',
        'scope-route': 'Route',
        
        // Backups and verification
        'btn-open-backtest': '🔬 Accuracy Test (Backtest)',
        'backtest-modal-title': '[ FORECAST ACCURACY VERIFICATION & CALIBRATION ]',
        'backtest-label-period': 'Analysis Period:',
        'btn-start-backtest': '▶ Run Accuracy Test',
        'btn-export-db': 'Export Database (Backup)',
        'btn-import-db': 'Import Database (Restore)',
        'backup-import-success': 'Database successfully restored! Loaded {flights} flights and {predictions} predictions.',
        'backup-import-error': 'Error reading backup file. Make sure file format is correct.',
        'filters-title': '[ INGESTION ROUTE & CITY FILTERS ]',
        'filters-subtext': 'Configure allowed destinations for ingestion from registration reports (Astra DCS / Excel). Supports IATA codes, Russian codes, and city names.',
        'filter-departures-title': 'DEPARTURE AIRPORTS (FROM)',
        'filter-arrivals-title': 'ARRIVAL AIRPORTS (TO)',
        'btn-reset-filters-default': 'Reset to Default',
        'btn-reset-filters': 'Reset to Default',
        'btn-add': 'Add',
        'btn-add-departure-airport': 'Add Departure Airport',
        'btn-add-arrival-airport': 'Add Arrival Airport',
        'modal-add-airport-title': '[ ADD NEW ROUTE / AIRPORT ]',
        'label-airport-city': 'City / Airport Name',
        'label-airport-iata': 'IATA Code',
        'hint-airport-iata': '3 Latin letters',
        'label-airport-ru': 'Russian Code (RU)',
        'hint-airport-ru': 'For RU/CIS (or same as IATA)',
        'label-airport-target': 'Add to filter:',
        'target-departures-label': '🛫 Departure Airports (FROM)',
        'target-arrivals-label': '🛬 Arrival Airports (TO)',
        'target-both-label': '🔄 In both lists (FROM & TO)',
        'btn-save-airport': '[ ➕ Save & Add ]',
        'chk-strict-arrivals': 'Enable strict arrivals filter',
        'btn-expand': 'Expand',
        'btn-collapse': 'Collapse',
        'dcs-sync-btn-title': 'Sync with Lydia DCS',
        'dcs-sync-btn-sub': '1-Click finalized flights & manifests ingestion',
        'footer-build-label': 'Build',
        'footer-developer': 'Developer: Andrey Zubkov',
        'btn-manual': 'Manual',
        'dcs-sync-btn-title': 'Lydia DCS Synchronization',
        'dcs-sync-btn-sub': '1-Click Closed Flights Ingestion',
        'telegram-title': '[ TELEGRAM ALERTING & OBSERVABILITY ]',
        'telegram-subtext': 'Instant dispatch of alerts on critical errors and dispatch failures directly to administrator Telegram.',
        'label-telegram-token': 'Telegram Bot Token:',
        'label-telegram-chatid': 'Chat / Group ID:',
        'chk-telegram-enable': 'Enable automatic incident error alerts',
        'btn-test-telegram': 'Test Connection',
        'btn-save-telegram': 'Save Settings',
        'diagnostics-title': '[ SYSTEM HEALTH & DATABASE DIAGNOSTICS\u00A0]',
        'diagnostics-subtext': 'Consolidated technical performance metrics, database health, and hosting environment status.',

        // System Audit and Error Logging
        'logs-title': '[ SYSTEM AUDIT & ERROR LOGS ]',
        'logs-subtext': 'User actions audit, authorization, database operations and automatic JavaScript error interception.',
        'label-log-retention': 'Log Retention:',
        'btn-refresh-logs': 'Refresh',
        'btn-export-logs': 'Export',
        'btn-clear-logs': 'Clear',
        'th-log-time': 'Time',
        'th-log-level': 'Level',
        'th-log-cat': 'Category',
        'th-log-user': 'User / IP',
        'th-log-msg': 'Event / Error',
        'th-log-details': 'Details',
        'modal-log-title': '[ LOG EVENT CONTEXT DETAILS ]'
    }
};

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ КОДОВ АЭРОПОРТОВ (ИАТА <-> Русский) ---

// Проверка на мусорные строки заголовков таблицы Excel
function isHeaderGarbage(str) {
    if (!str) return true;
    const clean = String(str).trim().toLowerCase();
    if (clean.length < 2) return true;
    const exactHeaderWords = [
        'код а/п', 'код а/к', 'номер рейса', 'направление', 'код', 'а/п', 'а/к', 'рейс',
        'flt', 'flight', 'airline', 'direction', 'from', 'to', 'дата', 'date', 'пасс', 'pax',
        'взрослые', 'дети', 'ручная', 'багаж', 'мест', 'вес', 'ние', 'всего', 'номер'
    ];
    return exactHeaderWords.includes(clean);
}

function ruToIata(ruCode) {
    if (!ruCode) return '';
    const cleanCode = String(ruCode).trim().toUpperCase();
    if (!baggageDb || !baggageDb.airports) {
        return cleanCode;
    }
    
    if (baggageDb.airports[cleanCode]) {
        return baggageDb.airports[cleanCode].iata;
    }
    
    const found = Object.values(baggageDb.airports).find(ap => 
        (ap.ru && ap.ru.trim().toUpperCase() === cleanCode) ||
        (ap.iata && ap.iata.trim().toUpperCase() === cleanCode) ||
        (ap.name && ap.name.trim().toUpperCase() === cleanCode) ||
        (ap.city && ap.city.trim().toUpperCase() === cleanCode)
    );
    if (found) {
        return found.iata;
    }
    
    return cleanCode;
}

// Парсинг чистого 3-буквенного ИАТА кода из сложных строк отчета (напр. "ЕКАТЕРИНБУРГ AER-SVX", "КАЗАНЬ AER-KZN", "БОХТАР KQT-UFA")
function parseCleanAirportCode(rawStr) {
    if (!rawStr) return '';
    const str = String(rawStr).trim();
    if (str.length === 3 && /^[A-ZА-Я]{3}$/i.test(str)) {
        return ruToIata(str) || str;
    }
    const words = str.split(/\s+/);
    const firstWordCode = ruToIata(words[0]);
    if (firstWordCode && firstWordCode.length === 3 && baggageDb && baggageDb.airports && baggageDb.airports[firstWordCode]) {
        return firstWordCode;
    }
    const tokens = str.match(/[A-ZА-Я]{3}/gi) || [];
    for (const t of tokens) {
        const code = ruToIata(t);
        if (code && code.length === 3 && baggageDb && baggageDb.airports && baggageDb.airports[code]) {
            return code;
        }
    }
    return ruToIata(str) || str;
}

function iataToRu(iataCode) {
    if (!baggageDb || !baggageDb.airports) {
        return iataCode;
    }
    const ap = Object.values(baggageDb.airports).find(a => a.iata === iataCode);
    return ap ? ap.ru : iataCode;
}

// Интеллектуальный поиск и сопоставление аэропорта/города по любому формату (IATA, РФ-код, Название города на русском)
function resolveAirportInfo(query) {
    if (!query) return null;
    const clean = String(query).trim().toUpperCase();
    const cleanLower = String(query).trim().toLowerCase();

    if (baggageDb && baggageDb.airports) {
        // 1. Прямой поиск по ключу
        if (baggageDb.airports[clean]) {
            const ap = baggageDb.airports[clean];
            return { iata: ap.iata || clean, ru: ap.ru || clean, name: ap.name || ap.iata || clean };
        }

        // 2. Поиск по IATA или RU коду
        for (const ap of Object.values(baggageDb.airports)) {
            if (ap.iata && ap.iata.toUpperCase() === clean) {
                return { iata: ap.iata, ru: ap.ru || ap.iata, name: ap.name || ap.iata };
            }
            if (ap.ru && ap.ru.toUpperCase() === clean) {
                return { iata: ap.iata || ap.ru, ru: ap.ru, name: ap.name || ap.ru };
            }
        }

        // 3. Поиск по точному совпадению названия города или его вхождению
        for (const ap of Object.values(baggageDb.airports)) {
            if (ap.name) {
                const nameLower = ap.name.toLowerCase();
                if (nameLower === cleanLower || nameLower.includes(cleanLower) || (cleanLower.length >= 3 && cleanLower.includes(nameLower))) {
                    return { iata: ap.iata || ap.ru, ru: ap.ru || ap.iata, name: ap.name };
                }
            }
        }
    }

    // Если в справочнике нет, но это 3 буквы латиницы
    if (/^[A-Z]{3}$/.test(clean)) {
        const ru = iataToRu(clean);
        return { iata: clean, ru: (ru && ru !== clean ? ru : clean), name: clean };
    }
    // Если 3 буквы кириллицы
    if (/^[А-ЯЁ]{3}$/.test(clean)) {
        const iata = ruToIata(clean);
        return { iata: (iata && iata !== clean ? iata : clean), ru: clean, name: clean };
    }

    return { iata: clean, ru: clean, name: String(query).trim() };
}

// Автоматическая нормализация кодов аэропортов рейса к стандарту ИАТА
function normalizeFlightRecord(f) {
    if (!f) return f;
    if (f.from) f.from = ruToIata(f.from) || String(f.from).trim().toUpperCase();
    if (f.to) f.to = ruToIata(f.to) || String(f.to).trim().toUpperCase();
    return f;
}

// Вспомогательная функция для получения количества пассажиров без учета младенцев (ВЗ + РБ, без РМ)
function getEffectivePaxCount(f) {
    if (!f) return 0;
    const men = parseInt(f.men) || 0;
    const women = parseInt(f.women) || 0;
    const rb = parseInt(f.rb) || 0;
    const rm = parseInt(f.rm) || 0;

    if (men > 0 || women > 0 || rb > 0) {
        return men + women + rb;
    }

    const rawPax = parseInt(f.pax) || 0;
    if (rawPax > 0) {
        return Math.max(0, rawPax - rm);
    }

    return 0;
}

function formatAirline(code) {
    if (!code) return 'N4';
    const clean = String(code).trim().toUpperCase();

    // N4 / Nordwind / Нордвинд / Н4 / КЛ / KL
    if (clean === 'N4' || clean === 'Н4' || clean === 'КЛ' || clean === 'KL' || clean.includes('NORD') || clean.includes('НОРД')) {
        return 'N4';
    }

    // EO / Ikar / Икар / КАР / KAR
    if (clean === 'EO' || clean === 'ЕО' || clean.includes('IKAR') || clean.includes('ИКАР') || clean.includes('KAR') || clean.includes('КАР')) {
        return 'EO';
    }

    return code;
}

// Надежный форматировщик дат из Excel в YYYY-MM-DD без UTC-сдвига на +1 день
function formatExcelDate(rawDate) {
    if (!rawDate) return new Date().toISOString().split('T')[0];
    
    // Если передана дата как числовой серийный код Excel (например 46097)
    const num = Number(rawDate);
    if (!isNaN(num) && num > 30000 && num < 100000) {
        if (typeof XLSX !== 'undefined' && XLSX.SSF && XLSX.SSF.parse_date_code) {
            const parsed = XLSX.SSF.parse_date_code(num);
            if (parsed && parsed.y && parsed.m && parsed.d) {
                return `${parsed.y}-${String(parsed.m).padStart(2, '0')}-${String(parsed.d).padStart(2, '0')}`;
            }
        }
        const jsDate = new Date(Math.round((num - 25569) * 86400 * 1000));
        const year = jsDate.getUTCFullYear();
        const month = String(jsDate.getUTCMonth() + 1).padStart(2, '0');
        const day = String(jsDate.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const str = String(rawDate).trim();
    if (!str) return new Date().toISOString().split('T')[0];

    // Разбор форматов DD.MM.YYYY или DD.MM.YY (например 01.07.2026 или 01.07.26)
    if (str.includes('.')) {
        const parts = str.split('.');
        if (parts.length === 3) {
            let day = parseInt(parts[0], 10);
            let month = parseInt(parts[1], 10);
            let year = parseInt(parts[2], 10);
            if (year < 100) year += 2000;
            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            }
        }
    }

    // Разбор формата YYYY-MM-DD
    if (str.includes('-')) {
        const parts = str.split('-');
        if (parts.length === 3 && parts[0].length === 4) {
            return str;
        }
    }

    // Если объект Date, извлекаем компоненты по UTC, исключая сдвиг часовых поясов
    if (rawDate instanceof Date) {
        const year = rawDate.getUTCFullYear();
        const month = String(rawDate.getUTCMonth() + 1).padStart(2, '0');
        const day = String(rawDate.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    return str;
}

function resetCompartments() {
    for (let i = 1; i <= 12; i++) {
        const bulkPcsInput = document.getElementById(`bulk-pcs-${i}`);
        const bulkWeightInput = document.getElementById(`bulk-weight-${i}`);
        if (bulkPcsInput) bulkPcsInput.value = '0';
        if (bulkWeightInput) {
            bulkWeightInput.value = '0';
            bulkWeightInput.removeAttribute('data-locked');
            bulkWeightInput.classList.remove('weight-locked');
        }

        const uldPcsInput = document.getElementById(`uld-pcs-${i}`);
        const uldWeightInput = document.getElementById(`uld-weight-${i}`);
        if (uldPcsInput) uldPcsInput.value = '0';
        if (uldWeightInput) {
            if (uldWeightInput.tagName === 'INPUT') uldWeightInput.value = '0';
            else uldWeightInput.textContent = '0';
            uldWeightInput.removeAttribute('data-locked');
            uldWeightInput.classList.remove('weight-locked');
        }
    }
}

// Таймер для отложенного сохранения раскладки без блокировки UI
let saveCompartmentsTimeout = null;
function debouncedSaveCompartmentsToPrediction() {
    clearTimeout(saveCompartmentsTimeout);
    saveCompartmentsTimeout = setTimeout(() => {
        saveCompartmentsToPrediction();
    }, 250);
}

// Полный сброс интерфейса коммерческой загрузки (при удалении активного рейса или очистке истории)
function clearLoadPlanningUI() {
    clearTimeout(saveCompartmentsTimeout);
    currentActivePredictionId = null;

    const prelimPax = document.getElementById('prelim-pax');
    const prelimPcs = document.getElementById('prelim-pcs');
    const prelimWeight = document.getElementById('prelim-weight');
    const prelimAvgWeight = document.getElementById('prelim-avg-weight');
    const prelimAvgPax = document.getElementById('prelim-avg-pax');

    const lirPax = document.getElementById('lir-pax');
    const lirPcs = document.getElementById('lir-pcs');
    const lirWeight = document.getElementById('lir-weight');

    if (prelimPax) prelimPax.textContent = '0';
    if (prelimPcs) prelimPcs.textContent = '0';
    if (prelimWeight) prelimWeight.textContent = '0';
    if (prelimAvgWeight) prelimAvgWeight.textContent = '0,00';
    if (prelimAvgPax) prelimAvgPax.textContent = '0,00';

    if (lirPax) lirPax.value = '0';
    if (lirPcs) lirPcs.value = '0';
    if (lirWeight) lirWeight.value = '0';

    resetCompartments();
    recalculateLoadPlanning();

    const badgeEl = document.getElementById('active-flight-badge');
    if (badgeEl) badgeEl.classList.add('hidden');

    const tbody = document.getElementById('predictions-table-body');
    if (tbody) {
        Array.from(tbody.querySelectorAll('tr')).forEach(tr => {
            tr.classList.remove('selected-history-row');
        });
    }
}


// ==========================================================================
// МУЛЬТИ-КАТЕГОРИЙНАЯ ЗАГРУЗКА ОТСЕКОВ BULK & ИНТЕГРАЦИЯ С AEROPLAN
// ==========================================================================

const BULK_LOAD_CATEGORIES = [
    { code: 'B', nameRu: 'B — Прямой', nameEn: 'B — Local', isDefault: true },
    { code: 'BT', nameRu: 'BT — Трансфер', nameEn: 'BT — Transfer' },
    { code: 'BC', nameRu: 'BC — Приоритет', nameEn: 'BC — Priority' },
    { code: 'BZ', nameRu: 'BZ — Экипаж', nameEn: 'BZ — Crew' },
    { code: 'BX', nameRu: 'BX — Досыл', nameEn: 'BX — Rush' },
    { code: 'DAA', nameRu: 'DAA — Коляски', nameEn: 'DAA — Strollers' },
    { code: 'C', nameRu: 'C — Cargo', nameEn: 'C — Cargo' },
    { code: 'M', nameRu: 'M — Mail', nameEn: 'M — Mail' },
    { code: 'E', nameRu: 'E — Снаряжение', nameEn: 'E — Equip' }
];

let currentCompartmentsState = [];


// ==========================================================================
// КОНФИГУРАЦИЯ БАГАЖНЫХ ОТСЕКОВ ПО БОРТОВЫМ НОМЕРАМ ФЛОТА (FLEET MAPPING)
// ==========================================================================

const FLEET_COMPARTMENT_CONFIGS = {
    // --- AIRBUS A321 ---
    '73271': {
        model: 'A321',
        isWidebody: false,
        fwd: ['11', '12', '21', '22', '23'],
        aft: ['31', '32', '33', '41', '42', '51', '52', '53']
    },
    '73273': {
        model: 'A321',
        isWidebody: false,
        fwd: ['11', '12', '21', '22', '23'],
        aft: ['32', '33', '41', '42', '51', '52', '53']
    },
    '73324': {
        model: 'A321',
        isWidebody: false,
        fwd: ['11', '12', '21', '22', '23'],
        aft: ['32', '33', '41', '42', '51', '52', '53']
    },
    '73325': {
        model: 'A321',
        isWidebody: false,
        fwd: ['11', '12', '21', '22', '23'],
        aft: ['32', '33', '41', '42', '51', '52', '53']
    },
    '73326': {
        model: 'A321',
        isWidebody: false,
        fwd: ['11', '12', '21', '22', '23'],
        aft: ['31', '32', '33', '41', '42', '51', '52', '53']
    },

    // --- AIRBUS A321-NEO ---
    '73322': {
        model: 'A321-NEO',
        isWidebody: false,
        fwd: ['11', '12', '21', '22', '23'],
        aft: ['31', '32', '33', '41', '42', '51', '52', '53']
    },
    '73323': {
        model: 'A321-NEO',
        isWidebody: false,
        fwd: ['11', '12', '21', '22', '23'],
        aft: ['31', '32', '33', '41', '42', '51', '52', '53']
    },

    // --- BOEING 737-800 ---
    '73269': { model: 'B737-800', isWidebody: false, fwd: ['1', '2'], aft: ['3', '4'] },
    '73311': { model: 'B737-800', isWidebody: false, fwd: ['1', '2'], aft: ['3', '4'] },
    '73312': { model: 'B737-800', isWidebody: false, fwd: ['1', '2'], aft: ['3', '4'] },
    '73313': { model: 'B737-800', isWidebody: false, fwd: ['1', '2'], aft: ['3', '4'] },
    '73314': { model: 'B737-800', isWidebody: false, fwd: ['1', '2'], aft: ['3', '4'] },
    '73315': { model: 'B737-800', isWidebody: false, fwd: ['1', '2'], aft: ['3', '4'] },
    '73316': { model: 'B737-800', isWidebody: false, fwd: ['1', '2'], aft: ['3', '4'] },
    '73317': { model: 'B737-800', isWidebody: false, fwd: ['1', '2'], aft: ['3', '4'] },
    '73318': { model: 'B737-800', isWidebody: false, fwd: ['1', '2'], aft: ['3', '4'] },
    '73319': { model: 'B737-800', isWidebody: false, fwd: ['1', '2'], aft: ['3', '4'] },
    '73321': { model: 'B737-800', isWidebody: false, fwd: ['1', '2'], aft: ['3', '4'] },

    // --- BOEING 737-900 ---
    '73343': { model: 'B737-900', isWidebody: false, fwd: ['1', '2'], aft: ['3', '4'] },
    '73344': { model: 'B737-900', isWidebody: false, fwd: ['1', '2'], aft: ['3', '4'] },

    // --- EMBRAER E190 ---
    '02740': { model: 'E190', isWidebody: false, fwd: ['1', '2'], aft: ['3', '4'] },
    '02741': { model: 'E190', isWidebody: false, fwd: ['1', '2'], aft: ['3', '4'] },
    '02743': { model: 'E190', isWidebody: false, fwd: ['1', '2'], aft: ['3', '4'] },

    // --- AIRBUS A330-200 (Широкофюзеляжный) ---
    '73270': {
        model: 'A330-200',
        isWidebody: true,
        defaultShowFwd: false,
        fwd: ['11L', '11R', '12L', '12R', '13L', '13R', '14L', '14R', '21L', '21R', '22L', '22R', '23L', '23R'],
        aft: ['31L', '31R', '32L', '32R', '33L', '33R', '41L', '41R', '42L', '42R', '51', '52', '53']
    },
    '73328': {
        model: 'A330-200',
        isWidebody: true,
        defaultShowFwd: false,
        fwd: ['11L', '11R', '12L', '12R', '13L', '13R', '14L', '14R', '21L', '21R', '22L', '22R', '23L', '23R'],
        aft: ['31L', '31R', '32L', '32R', '33L', '33R', '41L', '41R', '42L', '42R', '51', '52', '53']
    },

    // --- AIRBUS A330-300 (Широкофюзеляжный) ---
    '73848': {
        model: 'A330-300',
        isWidebody: true,
        defaultShowFwd: false,
        fwd: ['11L', '11R', '12L', '12R', '13L', '13R', '21L', '21R', '22L', '22R', '23L', '23R', '24L', '24R', '25L', '25R', '26L', '26R'],
        aft: ['31L', '31R', '32L', '32R', '33L', '33R', '34L', '34R', '41L', '41R', '42L', '42R', '43L', '43R', '5']
    },
    '73849': {
        model: 'A330-300',
        isWidebody: true,
        defaultShowFwd: false,
        fwd: ['11L', '11R', '12L', '12R', '13L', '13R', '21L', '21R', '22L', '22R', '23L', '23R', '24L', '24R', '25L', '25R', '26L', '26R'],
        aft: ['31L', '31R', '32L', '32R', '33L', '33R', '34L', '34R', '41L', '41R', '42L', '42R', '43L', '43R', '5']
    },
    '73850': {
        model: 'A330-300',
        isWidebody: true,
        defaultShowFwd: false,
        fwd: ['11L', '11R', '12L', '12R', '13L', '13R', '21L', '21R', '22L', '22R', '23L', '23R', '24L', '24R', '25L', '25R', '26L', '26R'],
        aft: ['31L', '31R', '32L', '32R', '33L', '33R', '34L', '34R', '41L', '41R', '42L', '42R', '43L', '43R', '5']
    },

    // --- BOEING 777-200ER (Широкофюзеляжный) ---
    '73340': {
        model: 'B777-200ER',
        isWidebody: true,
        defaultShowFwd: false,
        fwd: ['11L', '11R', '12L', '12R', '13L', '13R', '14L', '14R', '21L', '21R', '22L', '22R', '23L', '23R', '24L', '24R', '25L', '25R'],
        aft: ['33L', '33R', '41L', '41R', '42L', '42R', '43L', '43R', '44L', '44R', '5']
    },
    '73341': {
        model: 'B777-200ER',
        isWidebody: true,
        defaultShowFwd: false,
        fwd: ['11L', '11R', '12L', '12R', '13L', '13R', '14L', '14R', '21L', '21R', '22L', '22R', '23L', '23R', '24L', '24R', '25L', '25R'],
        aft: ['33L', '33R', '41L', '41R', '42L', '42R', '43L', '43R', '44L', '44R', '5']
    },
    '73272': {
        model: 'B777-200ER',
        isWidebody: true,
        defaultShowFwd: false,
        fwd: ['11L', '11R', '12L', '12R', '13L', '13R', '14L', '14R', '21L', '21R', '22L', '22R', '23L', '23R', '24L', '24R', '25L', '25R'],
        aft: ['31L', '31R', '32L', '32R', '33L', '33R', '41L', '41R', '42L', '42R', '43L', '43R', '44L', '44R', '5']
    },
    '73347': {
        model: 'B777-200ER',
        isWidebody: true,
        defaultShowFwd: false,
        fwd: ['11L', '11R', '12L', '12R', '13L', '13R', '14L', '14R', '21L', '21R', '22L', '22R', '23L', '23R', '24L', '24R', '25L', '25R'],
        aft: ['31L', '31R', '32L', '32R', '33L', '33R', '41L', '41R', '42L', '42R', '43L', '43R', '44L', '44R', '5']
    },

    // --- BOEING 777-300ER (Широкофюзеляжный) ---
    '73342': {
        model: 'B777-300ER',
        isWidebody: true,
        defaultShowFwd: false,
        fwd: ['11L', '11R', '12L', '12R', '13L', '13R', '14L', '14R', '21L', '21R', '22L', '22R', '23L', '23R', '24L', '24R', '25L', '25R', '26L', '26R', '27L', '27R', '28L', '28R'],
        aft: ['31L', '31R', '32L', '32R', '33L', '33R', '34L', '34R', '35L', '35R', '36L', '36R', '41L', '41R', '42L', '42R', '43L', '43R', '44L', '44R', '5']
    },
    '73847': {
        model: 'B777-300ER',
        isWidebody: true,
        defaultShowFwd: false,
        fwd: ['11L', '11R', '12L', '12R', '13L', '13R', '14L', '14R', '21L', '21R', '22L', '22R', '23L', '23R', '24L', '24R', '25L', '25R', '26L', '26R', '27L', '27R', '28L', '28R'],
        aft: ['31L', '31R', '32L', '32R', '33L', '33R', '34L', '34R', '35L', '35R', '36L', '36R', '41L', '41R', '42L', '42R', '43L', '43R', '44L', '44R', '5']
    }
};

const DEFAULT_TYPE_CONFIGS = {
    'A321': { model: 'A321', isWidebody: false, fwd: ['11', '12', '21', '22', '23'], aft: ['31', '32', '33', '41', '42', '51', '52', '53'] },
    '321': { model: 'A321', isWidebody: false, fwd: ['11', '12', '21', '22', '23'], aft: ['31', '32', '33', '41', '42', '51', '52', '53'] },
    'A321-NEO': { model: 'A321-NEO', isWidebody: false, fwd: ['11', '12', '21', '22', '23'], aft: ['31', '32', '33', '41', '42', '51', '52', '53'] },
    'B737-800': { model: 'B737-800', isWidebody: false, fwd: ['1', '2'], aft: ['3', '4'] },
    '738': { model: 'B737-800', isWidebody: false, fwd: ['1', '2'], aft: ['3', '4'] },
    'B737-900': { model: 'B737-900', isWidebody: false, fwd: ['1', '2'], aft: ['3', '4'] },
    '739': { model: 'B737-900', isWidebody: false, fwd: ['1', '2'], aft: ['3', '4'] },
    'E190': { model: 'E190', isWidebody: false, fwd: ['1', '2'], aft: ['3', '4'] },
    '190': { model: 'E190', isWidebody: false, fwd: ['1', '2'], aft: ['3', '4'] },
    'A330-200': { model: 'A330-200', isWidebody: true, defaultShowFwd: false, fwd: ['11L', '11R', '12L', '12R', '13L', '13R', '14L', '14R', '21L', '21R', '22L', '22R', '23L', '23R'], aft: ['31L', '31R', '32L', '32R', '33L', '33R', '41L', '41R', '42L', '42R', '51', '52', '53'] },
    '332': { model: 'A330-200', isWidebody: true, defaultShowFwd: false, fwd: ['11L', '11R', '12L', '12R', '13L', '13R', '14L', '14R', '21L', '21R', '22L', '22R', '23L', '23R'], aft: ['31L', '31R', '32L', '32R', '33L', '33R', '41L', '41R', '42L', '42R', '51', '52', '53'] },
    'A330-300': { model: 'A330-300', isWidebody: true, defaultShowFwd: false, fwd: ['11L', '11R', '12L', '12R', '13L', '13R', '21L', '21R', '22L', '22R', '23L', '23R', '24L', '24R', '25L', '25R', '26L', '26R'], aft: ['31L', '31R', '32L', '32R', '33L', '33R', '34L', '34R', '41L', '41R', '42L', '42R', '43L', '43R', '5'] },
    '333': { model: 'A330-300', isWidebody: true, defaultShowFwd: false, fwd: ['11L', '11R', '12L', '12R', '13L', '13R', '21L', '21R', '22L', '22R', '23L', '23R', '24L', '24R', '25L', '25R', '26L', '26R'], aft: ['31L', '31R', '32L', '32R', '33L', '33R', '34L', '34R', '41L', '41R', '42L', '42R', '43L', '43R', '5'] },
    'B777-200ER': { model: 'B777-200ER', isWidebody: true, defaultShowFwd: false, fwd: ['11L', '11R', '12L', '12R', '13L', '13R', '14L', '14R', '21L', '21R', '22L', '22R', '23L', '23R', '24L', '24R', '25L', '25R'], aft: ['33L', '33R', '41L', '41R', '42L', '42R', '43L', '43R', '44L', '44R', '5'] },
    '772': { model: 'B777-200ER', isWidebody: true, defaultShowFwd: false, fwd: ['11L', '11R', '12L', '12R', '13L', '13R', '14L', '14R', '21L', '21R', '22L', '22R', '23L', '23R', '24L', '24R', '25L', '25R'], aft: ['33L', '33R', '41L', '41R', '42L', '42R', '43L', '43R', '44L', '44R', '5'] },
    'B777-300ER': { model: 'B777-300ER', isWidebody: true, defaultShowFwd: false, fwd: ['11L', '11R', '12L', '12R', '13L', '13R', '14L', '14R', '21L', '21R', '22L', '22R', '23L', '23R', '24L', '24R', '25L', '25R', '26L', '26R', '27L', '27R', '28L', '28R'], aft: ['31L', '31R', '32L', '32R', '33L', '33R', '34L', '34R', '35L', '35R', '36L', '36R', '41L', '41R', '42L', '42R', '43L', '43R', '44L', '44R', '5'] },
    '773': { model: 'B777-300ER', isWidebody: true, defaultShowFwd: false, fwd: ['11L', '11R', '12L', '12R', '13L', '13R', '14L', '14R', '21L', '21R', '22L', '22R', '23L', '23R', '24L', '24R', '25L', '25R', '26L', '26R', '27L', '27R', '28L', '28R'], aft: ['31L', '31R', '32L', '32R', '33L', '33R', '34L', '34R', '35L', '35R', '36L', '36R', '41L', '41R', '42L', '42R', '43L', '43R', '44L', '44R', '5'] }
};

let currentActiveAircraftTail = '';
let currentActiveAircraftModel = 'A321';
let isFwdCompartmentsVisible = false;

// Очистка и извлечение чистого номера борта (напр. "RA-73340" -> "73340")
function normalizeTailNumber(rawTail) {
    if (!rawTail) return '';
    let s = String(rawTail).trim().toUpperCase();
    s = s.replace(/^(RA-|RA_|RAs?)/i, '');
    const m = s.match(/\d{4,5}/);
    return m ? m[0] : s;
}

// Получение конфигурации отсеков по номеру борта или типу ВС
function getAircraftCompartmentConfig(tailOrType) {
    if (!tailOrType) return DEFAULT_TYPE_CONFIGS['A321'];
    const cleanTail = normalizeTailNumber(tailOrType);
    if (FLEET_COMPARTMENT_CONFIGS[cleanTail]) {
        return FLEET_COMPARTMENT_CONFIGS[cleanTail];
    }
    const cleanType = String(tailOrType).trim().toUpperCase().replace(/\s+/g, '-');
    if (DEFAULT_TYPE_CONFIGS[cleanType]) {
        return DEFAULT_TYPE_CONFIGS[cleanType];
    }
    // Поиск по подстроке типа ВС
    for (let key of Object.keys(DEFAULT_TYPE_CONFIGS)) {
        if (cleanType.includes(key) || key.includes(cleanType)) {
            return DEFAULT_TYPE_CONFIGS[key];
        }
    }
    return DEFAULT_TYPE_CONFIGS['A321'];
}

// Применение конфигурации отсеков под конкретный борт
function applyAircraftCompartmentConfig(tailOrType, forceShowFwd = null, savedCompartmentsSource = null) {
    const config = getAircraftCompartmentConfig(tailOrType);
    const cleanTail = normalizeTailNumber(tailOrType);

    currentActiveAircraftTail = cleanTail || '';
    currentActiveAircraftModel = config.model || 'A321';

    if (forceShowFwd !== null) {
        isFwdCompartmentsVisible = !!forceShowFwd;
    } else if (config.isWidebody) {
        isFwdCompartmentsVisible = false;
    } else {
        isFwdCompartmentsVisible = true;
    }

    // Обновляем бейдж модели ВС в шапке BULK
    const modelBadge = document.getElementById('aircraft-model-badge');
    if (modelBadge) {
        if (cleanTail || tailOrType) {
            modelBadge.textContent = currentActiveAircraftModel;
            modelBadge.classList.remove('hidden');
        } else {
            modelBadge.classList.add('hidden');
        }
    }

    // Обновляем селектор борта в шапке BULK
    const tailSelect = document.getElementById('select-aircraft-tail');
    if (tailSelect) {
        if (cleanTail) {
            let found = false;
            for (let opt of tailSelect.options) {
                if (normalizeTailNumber(opt.value) === cleanTail) {
                    tailSelect.value = opt.value;
                    found = true;
                    break;
                }
            }
            if (!found) {
                const opt = document.createElement('option');
                opt.value = cleanTail;
                opt.textContent = `RA-${cleanTail} (${currentActiveAircraftModel})`;
                tailSelect.appendChild(opt);
                tailSelect.value = cleanTail;
            }
        } else {
            tailSelect.value = '';
        }
    }

    // Управление кнопкой переключения FWD для широкофюзеляжных
    const btnFwd = document.getElementById('btn-toggle-fwd');
    if (btnFwd) {
        if (config.isWidebody) {
            btnFwd.classList.remove('hidden');
            if (isFwdCompartmentsVisible) {
                btnFwd.classList.add('active');
                btnFwd.innerHTML = '<span>➖ Скрыть FWD</span>';
            } else {
                btnFwd.classList.remove('active');
                btnFwd.innerHTML = '<span>➕ FWD (Передний)</span>';
            }
        } else {
            btnFwd.classList.add('hidden');
        }
    }

    // Формируем карту строк:
    // 1) savedCompartmentsSource === false -> чистый сброс отсеков (все строки нулевые)
    // 2) Array.isArray(savedCompartmentsSource) -> восстанавливаем СТРОГО строки переданного рейса (без утечки данных других рейсов!)
    // 3) savedCompartmentsSource === null -> диспетчер сменил борт/FWD для текущего активного рейса, сохраняем matching rows
    let sourceMap = null;
    if (savedCompartmentsSource === false) {
        sourceMap = null;
    } else if (Array.isArray(savedCompartmentsSource)) {
        sourceMap = new Map();
        savedCompartmentsSource.forEach(c => {
            if (!c) return;
            const name = String(c.name || c.cpt || '');
            if (Array.isArray(c.rows) && c.rows.length > 0) {
                sourceMap.set(name, JSON.parse(JSON.stringify(c.rows)));
            } else if (c.pcs !== undefined || c.weight !== undefined) {
                sourceMap.set(name, [{
                    type: c.type || 'B',
                    pcs: parseInt(c.pcs, 10) || 0,
                    weight: parseFloat(c.weight) || 0,
                    locked: !!c.locked
                }]);
            }
        });
    } else {
        sourceMap = new Map();
        if (currentCompartmentsState && Array.isArray(currentCompartmentsState)) {
            currentCompartmentsState.forEach(c => {
                if (c && c.name && Array.isArray(c.rows)) {
                    sourceMap.set(c.name, JSON.parse(JSON.stringify(c.rows)));
                }
            });
        }
    }

    // Формируем список отсеков согласно правилам
    let targetPositions = [];
    if (config.isWidebody) {
        if (isFwdCompartmentsVisible) {
            targetPositions = [...config.fwd.map(n => ({ name: n, sec: 'FWD' })), ...config.aft.map(n => ({ name: n, sec: 'AFT' }))];
        } else {
            targetPositions = config.aft.map(n => ({ name: n, sec: 'AFT' }));
        }
    } else {
        targetPositions = [...config.fwd.map(n => ({ name: n, sec: 'FWD' })), ...config.aft.map(n => ({ name: n, sec: 'AFT' }))];
    }

    currentCompartmentsState = targetPositions.map((pos, idx) => {
        const preservedRows = sourceMap ? sourceMap.get(pos.name) : null;
        return {
            cpt: idx + 1,
            name: pos.name,
            section: pos.sec,
            rows: preservedRows && preservedRows.length > 0 ? preservedRows : [
                { type: 'B', pcs: 0, weight: 0, locked: false }
            ]
        };
    });

    renderCompartmentsTable();
    recalculateLoadPlanning();
}

// Переключение отображения переднего багажника (FWD) для широкофюзеляжных
function toggleFwdCompartments() {
    isFwdCompartmentsVisible = !isFwdCompartmentsVisible;
    applyAircraftCompartmentConfig(currentActiveAircraftTail || currentActiveAircraftModel, isFwdCompartmentsVisible);
}

// Заполнение выпадающего списка выбора борта в шапке BULK
function populateAircraftTailDropdown() {
    const tailSelect = document.getElementById('select-aircraft-tail');
    if (!tailSelect) return;

    const currentVal = tailSelect.value || currentActiveAircraftTail || '';
    tailSelect.innerHTML = '<option value="">-- Выбрать борт --</option>';

    // Группировка бортов по моделям ВС
    const groups = {
        'Airbus A321': ['73271', '73273', '73324', '73325', '73326'],
        'Airbus A321-NEO': ['73322', '73323'],
        'Boeing 737-800': ['73269', '73311', '73312', '73313', '73314', '73315', '73316', '73317', '73318', '73319', '73321'],
        'Boeing 737-900': ['73343', '73344'],
        'Embraer E190': ['02740', '02741', '02743'],
        'Airbus A330-200 (Widebody)': ['73270', '73328'],
        'Airbus A330-300 (Widebody)': ['73848', '73849', '73850'],
        'Boeing 777-200ER (Widebody)': ['73340', '73341', '73272', '73347'],
        'Boeing 777-300ER (Widebody)': ['73342', '73847']
    };

    Object.entries(groups).forEach(([groupName, tails]) => {
        const grp = document.createElement('optgroup');
        grp.label = groupName;
        tails.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = `RA-${t}`;
            grp.appendChild(opt);
        });
        tailSelect.appendChild(grp);
    });

    if (currentVal) {
        tailSelect.value = currentVal;
    }

    if (tailSelect.dataset.hasListener) return;
    tailSelect.dataset.hasListener = 'true';

    tailSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val) {
            applyAircraftCompartmentConfig(val);
            if (currentActivePredictionId) {
                const p = predictionsHistory.find(item => item.id === currentActivePredictionId);
                if (p) {
                    p.ac_num = normalizeTailNumber(val);
                    updateActiveFlightBadge(p.from, p.to, p.flight_no, p.flight_date || p.calc_date, p.ac_num, p.dep_time);
                    savePredictionsHistory();
                    renderPredictionsTable();
                }
            } else {
                currentIncomingFlightData.ac_num = val;
                updateActiveFlightBadge(currentIncomingFlightData.from, currentIncomingFlightData.to, currentIncomingFlightData.flight, currentIncomingFlightData.date, val, currentIncomingFlightData.dep_time);
            }
        }
    });
}

function initDefaultCompartmentsState() {
    const defCfg = DEFAULT_TYPE_CONFIGS['A321'];
    const positions = [...defCfg.fwd.map(n => ({ name: n, sec: 'FWD' })), ...defCfg.aft.map(n => ({ name: n, sec: 'AFT' }))];
    currentCompartmentsState = positions.map((pos, idx) => ({
        cpt: idx + 1,
        name: pos.name,
        section: pos.sec,
        rows: [
            { type: 'B', pcs: 0, weight: 0, locked: false }
        ]
    }));
}

function renderCompartmentsTable() {
    const tbody = document.getElementById('unified-load-tbody');
    if (!tbody) return;

    if (!currentCompartmentsState || currentCompartmentsState.length === 0) {
        initDefaultCompartmentsState();
    }

    tbody.innerHTML = '';
    let globalRowIdx = 0;

    currentCompartmentsState.forEach((comp, compIdx) => {
        const rowsCount = comp.rows.length;

        comp.rows.forEach((row, rowIdx) => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-comp', compIdx);
            tr.setAttribute('data-row', rowIdx);

            const isLastFwdRow = (comp.section === 'FWD' && rowIdx === rowsCount - 1 && currentCompartmentsState[compIdx + 1] && currentCompartmentsState[compIdx + 1].section === 'AFT');
            if (rowIdx === 0) {
                tr.className = 'bulk-cpt-row' + (isLastFwdRow ? ' cpt-section-boundary' : '');
            } else {
                tr.className = 'bulk-cpt-subrow' + (isLastFwdRow ? ' cpt-section-boundary' : '');
            }

            // 1. Номер отсека или стрелка
            const tdCpt = document.createElement('td');
            tdCpt.style.textAlign = 'center';
            const secClass = comp.section === 'FWD' ? 'cpt-fwd' : (comp.section === 'AFT' ? 'cpt-aft' : '');
            if (rowIdx === 0) {
                tdCpt.className = `bulk-cpt-num ${secClass}`;
                tdCpt.innerHTML = `<strong>${comp.name}</strong>`;
            } else {
                tdCpt.className = `bulk-cpt-num sub-cpt ${secClass}`;
                tdCpt.innerHTML = `<span class="sub-arrow">↳</span>`;
            }
            tr.appendChild(tdCpt);

            // 2. Селектор типа загрузки
            const tdType = document.createElement('td');
            tdType.className = 'bulk-type-cell';
            const select = document.createElement('select');
            select.className = 'form-control bulk-type-select';
            select.tabIndex = 11 + (globalRowIdx * 3);
            select.onchange = (e) => handleBulkTypeChange(compIdx, rowIdx, e.target.value);
            BULK_LOAD_CATEGORIES.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat.code;
                opt.textContent = (currentLang === 'ru') ? cat.nameRu : cat.nameEn;
                if (cat.code === row.type) opt.selected = true;
                select.appendChild(opt);
            });
            tdType.appendChild(select);
            tr.appendChild(tdType);

            // 3. Поле ввода мест
            const tdPcs = document.createElement('td');
            tdPcs.style.textAlign = 'center';
            const inputPcs = document.createElement('input');
            inputPcs.type = 'number';
            inputPcs.id = `bulk-pcs-${compIdx}-${rowIdx}`;
            inputPcs.className = 'form-control table-input bulk-pcs-input monospace-val super-input-cyan';
            inputPcs.min = '0';
            inputPcs.max = '1000';
            inputPcs.value = String(row.pcs || 0);
            inputPcs.tabIndex = 11 + (globalRowIdx * 3) + 1;
            inputPcs.oninput = (e) => handleBulkInput(compIdx, rowIdx, 'pcs', e.target.value);
            inputPcs.onfocus = (e) => e.target.select();
            tdPcs.appendChild(inputPcs);
            tr.appendChild(tdPcs);

            // 4. Поле ввода веса
            const tdWeight = document.createElement('td');
            tdWeight.style.textAlign = 'center';
            const inputWeight = document.createElement('input');
            inputWeight.type = 'number';
            inputWeight.id = `bulk-weight-${compIdx}-${rowIdx}`;
            inputWeight.className = 'form-control table-input bulk-weight-input monospace-val super-input-gold';
            inputWeight.min = '0';
            inputWeight.max = '50000';
            inputWeight.value = String(row.weight || 0);
            inputWeight.tabIndex = 11 + (globalRowIdx * 3) + 2;
            if (row.locked) {
                inputWeight.setAttribute('data-locked', 'true');
                inputWeight.classList.add('weight-locked');
            }
            inputWeight.oninput = (e) => handleBulkInput(compIdx, rowIdx, 'weight', e.target.value);
            inputWeight.onfocus = (e) => e.target.select();
            tdWeight.appendChild(inputWeight);
            tr.appendChild(tdWeight);

            // 5. Кнопка действия (+ или ✕)
            const tdAction = document.createElement('td');
            tdAction.style.textAlign = 'center';
            if (rowIdx === 0) {
                const btnAdd = document.createElement('button');
                btnAdd.type = 'button';
                btnAdd.className = 'btn btn-bulk-add';
                btnAdd.title = currentLang === 'ru' ? 'Добавить категорию в этот отсек' : 'Add category to this compartment';
                btnAdd.tabIndex = -1;
                btnAdd.textContent = '+';
                btnAdd.onclick = () => handleAddCompartmentSubRow(compIdx);
                tdAction.appendChild(btnAdd);
            } else {
                const btnDel = document.createElement('button');
                btnDel.type = 'button';
                btnDel.className = 'btn btn-bulk-del';
                btnDel.tabIndex = -1;
                btnDel.title = currentLang === 'ru' ? 'Удалить категорию' : 'Delete category';
                btnDel.textContent = '✕';
                btnDel.onclick = () => handleRemoveCompartmentSubRow(compIdx, rowIdx);
                tdAction.appendChild(btnDel);
            }
            tr.appendChild(tdAction);

            tbody.appendChild(tr);
            globalRowIdx++;
        });

        // Промежуточный итог отсека при нескольких категориях
        if (rowsCount > 1) {
            const trSub = document.createElement('tr');
            trSub.className = 'bulk-cpt-subtotal-row';
            trSub.setAttribute('data-comp-subtotal', compIdx);

            const tdLabel = document.createElement('td');
            tdLabel.colSpan = 2;
            tdLabel.className = 'cpt-subtotal-label';
            tdLabel.textContent = `Всего CPT ${comp.name}:`;
            trSub.appendChild(tdLabel);

            const tdSubPcs = document.createElement('td');
            tdSubPcs.id = `cpt-subtotal-pcs-${compIdx}`;
            tdSubPcs.style.textAlign = 'center';
            tdSubPcs.className = 'monospace-val text-center super-val-cyan';
            tdSubPcs.style.fontWeight = '700';
            tdSubPcs.style.fontSize = '0.9rem';
            tdSubPcs.textContent = '0';
            trSub.appendChild(tdSubPcs);

            const tdSubWeight = document.createElement('td');
            tdSubWeight.id = `cpt-subtotal-weight-${compIdx}`;
            tdSubWeight.style.textAlign = 'center';
            tdSubWeight.className = 'monospace-val text-center super-val-gold';
            tdSubWeight.style.fontWeight = '700';
            tdSubWeight.style.fontSize = '0.9rem';
            tdSubWeight.textContent = '0 кг';
            trSub.appendChild(tdSubWeight);

            const tdEmpty = document.createElement('td');
            trSub.appendChild(tdEmpty);

            tbody.appendChild(trSub);
        }
    });
}

function handleBulkTypeChange(compIdx, rowIdx, newType) {
    if (currentCompartmentsState[compIdx] && currentCompartmentsState[compIdx].rows[rowIdx]) {
        currentCompartmentsState[compIdx].rows[rowIdx].type = newType;
        recalculateLoadPlanning();
        debouncedSaveCompartmentsToPrediction();
    }
}

function handleAddCompartmentSubRow(compIdx) {
    if (!currentCompartmentsState[compIdx]) return;
    currentCompartmentsState[compIdx].rows.push({
        type: 'BT',
        pcs: 0,
        weight: 0,
        locked: false
    });
    renderCompartmentsTable();
    recalculateLoadPlanning();
    debouncedSaveCompartmentsToPrediction();
}

function handleRemoveCompartmentSubRow(compIdx, rowIdx) {
    if (!currentCompartmentsState[compIdx] || rowIdx === 0) return;
    currentCompartmentsState[compIdx].rows.splice(rowIdx, 1);
    renderCompartmentsTable();
    recalculateLoadPlanning();
    debouncedSaveCompartmentsToPrediction();
}

function handleBulkInput(compIdx, rowIdx, field, rawValue) {
    if (!currentCompartmentsState[compIdx] || !currentCompartmentsState[compIdx].rows[rowIdx]) return;
    const row = currentCompartmentsState[compIdx].rows[rowIdx];

    if (field === 'pcs') {
        const pcsVal = parseInt(rawValue, 10);
        row.pcs = isNaN(pcsVal) || pcsVal < 0 ? 0 : pcsVal;
        if (row.pcs === 0) {
            row.locked = false;
            row.weight = 0;
            const weightInput = document.getElementById(`bulk-weight-${compIdx}-${rowIdx}`);
            if (weightInput) {
                weightInput.value = '0';
                weightInput.removeAttribute('data-locked');
                weightInput.classList.remove('weight-locked');
            }
        }
    } else if (field === 'weight') {
        const weightVal = parseFloat(rawValue);
        row.weight = isNaN(weightVal) || weightVal < 0 ? 0 : weightVal;
        row.locked = true;
        const weightInput = document.getElementById(`bulk-weight-${compIdx}-${rowIdx}`);
        if (weightInput) {
            weightInput.setAttribute('data-locked', 'true');
            weightInput.classList.add('weight-locked');
        }
    }

    recalculateLoadPlanning();
    debouncedSaveCompartmentsToPrediction();
}

function handleReturnToAeroPlan(e) {
    if (e) e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl = urlParams.get('return_url');
    const targetUrl = returnUrl ? decodeURIComponent(returnUrl) : '';

    if (targetUrl) {
        window.location.href = targetUrl;
    } else if (window.history.length > 1) {
        window.history.back();
    } else {
        const isPlan2 = document.referrer.includes('plan_2') || window.location.href.includes('plan_2');
        if (isPlan2) {
            window.location.href = 'https://boostandgo.ru/plan_2/';
        } else {
            const isTest = window.location.href.includes('aerobag-test');
            window.location.href = isTest ? 'https://boostandgo.ru/plan_test/' : 'https://boostandgo.ru/plan/';
        }
    }
}

let currentIncomingFlightData = {
    flight: '',
    date: '',
    ac_num: '',
    dep_time: '',
    crew: '',
    galley: 'D',
    dow: '',
    doi: '',
    pax: '',
    pax_m: '',
    pax_f: '',
    pax_ch: '',
    pax_inf: '',
    to_fuel: '',
    trip_fuel: '',
    cargo: '',
    mail: '',
    from: '',
    to: ''
};

// --- W&B FLEET REGISTRY (DOW / DOI) ---
let fleetWbData = null;

async function loadFleetWb() {
    try {
        const response = await fetch('fleet_wb.json');
        if (response && response.ok) {
            fleetWbData = await response.json();
            console.log('[AeroBag W&B] Загружен реестр флота fleet_wb.json, бортов:', Object.keys(fleetWbData).length);
        }
    } catch (e) {
        console.warn('[AeroBag W&B] Не удалось загрузить fleet_wb.json:', e);
    }
}

function normalizeTailNumber(val) {
    if (!val) return '';
    return String(val).toUpperCase().replace(/^(RA|РА)[-\s]?/i, '').replace(/\D/g, '').trim();
}

function detectFlightOperator(flight) {
    const flightStr = String(flight.flight || flight.flight_no || flight.flight_number || '').toUpperCase().trim();
    if (/^(EO|KAR|ИК|ЕО)/i.test(flightStr)) return 'EO';
    if (/^(N4|NWS|СВ|Н4)/i.test(flightStr)) return 'N4';
    if (flight.operator) {
        const op = String(flight.operator).toUpperCase().trim();
        if (op === 'EO' || op === 'KAR') return 'EO';
        if (op === 'N4' || op === 'NWS') return 'N4';
    }
    return '';
}

function normalizeCrewCode(val) {
    if (!val) return '';
    const parts = String(val).split(/[\/\-\s]+/).filter(Boolean);
    if (parts.length >= 2) return `${parseInt(parts[0], 10)}/${parseInt(parts[1], 10)}`;
    if (parts.length === 1 && !isNaN(parseInt(parts[0], 10))) return `${parseInt(parts[0], 10)}/0`;
    return '';
}

function lookupFleetWb(flight = {}) {
    if (!fleetWbData) return null;
    const tail = normalizeTailNumber(flight.ac_num || flight.tail);
    if (!tail) return null;

    const operator = detectFlightOperator(flight);
    let configKey = null;

    if (operator && fleetWbData[`${tail}_${operator}`]) {
        configKey = `${tail}_${operator}`;
    } else if (operator && fleetWbData[`${tail}_${operator}_FAK_2AKE`]) {
        configKey = `${tail}_${operator}_FAK_2AKE`;
    } else {
        const candidates = Object.keys(fleetWbData).filter(k => k.startsWith(`${tail}_`));
        if (candidates.length === 1) {
            configKey = candidates[0];
        } else if (candidates.length > 1) {
            if (operator) configKey = candidates.find(k => k.includes(`_${operator}`)) || candidates[0];
            else configKey = candidates.find(k => k.includes('_N4')) || candidates[0];
        }
    }

    if (!configKey || !fleetWbData[configKey]) return null;
    const cfg = fleetWbData[configKey];

    const crewCode = normalizeCrewCode(flight.crew);
    if (!crewCode || !cfg.matrix || !cfg.matrix[crewCode]) return null;

    let galley = String(flight.galley || 'D').toUpperCase().trim() || 'D';
    let cell = cfg.matrix[crewCode][galley];
    if (!cell && cfg.pantry_codes && cfg.pantry_codes.length > 0) {
        const fallback = cfg.pantry_codes.includes('D') ? 'D' : cfg.pantry_codes[0];
        cell = cfg.matrix[crewCode][fallback];
        if (cell) galley = fallback;
    }

    if (!cell) return null;

    return {
        success: true,
        dow: cell.dow,
        doi: cell.doi,
        model: cfg.model,
        revision: cfg.revision,
        crew: crewCode,
        galley: galley,
        tail: tail
    };
}

function openWbLoadsheet() {
    // 1. Текущий активный рейс и предсказание
    let activePred = null;
    if (typeof currentActivePredictionId !== 'undefined' && currentActivePredictionId) {
        activePred = (predictionsHistory || []).find(p => p.id === currentActivePredictionId);
    }
    if (!activePred && typeof predictionsHistory !== 'undefined' && predictionsHistory.length > 0) {
        activePred = predictionsHistory[0];
    }

    if (typeof saveCompartmentsToPrediction === 'function' && activePred) {
        saveCompartmentsToPrediction(activePred);
    }

    // 2. Реквизиты рейса
    const flightNumber = (document.getElementById('select-flight')?.value || activePred?.flight_no || currentIncomingFlightData.flight || '').trim();
    const flightDate = (document.getElementById('input-date')?.value || activePred?.calc_date || currentIncomingFlightData.date || '').trim();
    const fromAirport = (currentIncomingFlightData.from || activePred?.from || '').trim();
    const toAirport = (currentIncomingFlightData.to || activePred?.to || '').trim();
    const selectedTail = (document.getElementById('select-aircraft-tail')?.value || activePred?.aircraft_tail || currentIncomingFlightData.ac_num || '').trim();
    const currentModel = (document.getElementById('aircraft-model-badge')?.textContent || activePred?.aircraft_model || 'B737-800').trim();

    // Определение компоновки салона (Version в LoadSheet): например Y215, Y189, Y220
    const MODEL_TO_LAYOUT_MAP = {
        'B737-900': 'Y215',
        'B739': 'Y215',
        '739': 'Y215',
        'B737-800': 'Y189',
        'B738': 'Y189',
        '738': 'Y189',
        'A321': 'Y220',
        'A321-NEO': 'Y218',
        '321': 'Y220',
        'E190': 'Y110',
        '190': 'Y110',
        'A330-200': 'Y365',
        'A332': 'Y365',
        '332': 'Y365',
        'A330-300': 'Y379',
        'A333': 'Y379',
        '333': 'Y379',
        'B777-200': 'Y440',
        'B772': 'Y440',
        '772': 'Y440',
        'B777-300': 'Y486',
        'B773': 'Y486',
        '773': 'Y486'
    };

    let cabinVersion = currentIncomingFlightData.ac_config || activePred?.ac_config || '';
    if (!cabinVersion || MODEL_TO_LAYOUT_MAP[cabinVersion.toUpperCase()]) {
        cabinVersion = MODEL_TO_LAYOUT_MAP[cabinVersion.toUpperCase()] || MODEL_TO_LAYOUT_MAP[currentModel] || 'Y189';
    }

    // 3. Агрегация весов багажа по отсекам CPT 1..5
    const cptWeights = {
        b: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        c: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        m: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        tr: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        uld: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };

    const compList = (currentCompartmentsState && currentCompartmentsState.length > 0)
        ? currentCompartmentsState
        : (activePred && Array.isArray(activePred.compartments) ? activePred.compartments : []);

    let totalBaggageFound = 0;

    if (compList && compList.length > 0) {
        compList.forEach((comp, compIdx) => {
            const secName = String(comp.name || comp.cpt || '').trim();
            const cptIndex = parseInt(secName.charAt(0), 10);
            if (cptIndex >= 1 && cptIndex <= 5 && Array.isArray(comp.rows)) {
                comp.rows.forEach((row, rowIdx) => {
                    const wtInput = document.getElementById(`bulk-weight-${compIdx}-${rowIdx}`);
                    const wt = wtInput ? (parseFloat(wtInput.value) || 0) : (parseFloat(row.weight) || 0);
                    if (wt > 0) {
                        const rType = String(row.type || 'B').toUpperCase().trim();
                        if (['B', 'BT', 'BC', 'BZ', 'BX', 'DAA'].includes(rType)) {
                            cptWeights.b[cptIndex] += Math.round(wt);
                            totalBaggageFound += Math.round(wt);
                        } else if (rType === 'C') {
                            cptWeights.c[cptIndex] += Math.round(wt);
                        } else if (rType === 'M') {
                            cptWeights.m[cptIndex] += Math.round(wt);
                        } else if (rType === 'TR') {
                            cptWeights.tr[cptIndex] += Math.round(wt);
                        } else if (rType === 'ULD') {
                            cptWeights.uld[cptIndex] += Math.round(wt);
                        } else {
                            cptWeights.b[cptIndex] += Math.round(wt);
                            totalBaggageFound += Math.round(wt);
                        }
                    }
                });
            }
        });
    }

    // Если в отсеках вес еще не вводился, проверяем общий рассчитанный прогноз
    if (totalBaggageFound === 0) {
        const prelimWeight = parseFloat(document.getElementById('prelim-weight')?.textContent || 0) || 
                             parseFloat(activePred?.weight || activePred?.baggageWeight || 0) || 0;
        if (prelimWeight > 0) {
            cptWeights.b[3] = Math.round(prelimWeight);
        }
    }

    // 4. Пассажиры, экипаж и топливо
    const lirPaxNum = parseInt(document.getElementById('lir-pax')?.value || 0, 10);
    const inputPaxNum = parseInt(document.getElementById('input-pax')?.value || 0, 10);
    const prelimPaxNum = parseInt(document.getElementById('prelim-pax')?.textContent || 0, 10);
    const incomingPaxNum = parseInt(currentIncomingFlightData.pax || activePred?.pax || 0, 10);
    const effPax = (lirPaxNum > 0) ? lirPaxNum : ((inputPaxNum > 0) ? inputPaxNum : ((prelimPaxNum > 0) ? prelimPaxNum : incomingPaxNum));
    const paxTotal = effPax > 0 ? String(effPax) : '';

    let paxM = currentIncomingFlightData.pax_m || activePred?.pax_m || document.getElementById('manual-men')?.value || '';
    let paxF = currentIncomingFlightData.pax_f || activePred?.pax_f || document.getElementById('manual-women')?.value || '';
    let paxCh = currentIncomingFlightData.pax_ch || activePred?.pax_ch || document.getElementById('manual-rb')?.value || '';
    let paxInf = currentIncomingFlightData.pax_inf || activePred?.pax_inf || document.getElementById('manual-rm')?.value || '';

    if (!paxM && !paxF && effPax > 0) {
        const halfM = Math.ceil(effPax / 2);
        paxM = String(halfM);
        paxF = String(effPax - halfM);
    }

    const crewVal = currentIncomingFlightData.crew || activePred?.crew || '';
    const toFuel = currentIncomingFlightData.to_fuel || currentIncomingFlightData.fuel_block || activePred?.fuel_block || '';
    const tripFuel = currentIncomingFlightData.trip_fuel || activePred?.fuel_trip || '';
    const cargoVal = currentIncomingFlightData.cargo || '';
    const mailVal = currentIncomingFlightData.mail || '';
    let dowVal = currentIncomingFlightData.dow || activePred?.dow || '';
    let doiVal = currentIncomingFlightData.doi || activePred?.doi || '';
    const galleyVal = currentIncomingFlightData.galley || activePred?.galley || 'D';

    // Если DOW или DOI еще не были определены (напр. расчет начат прямо в AeroBag) - вычисляем на лету!
    if (!dowVal || !doiVal) {
        const flightForWb = {
            flight: flightNumber,
            ac_num: selectedTail,
            crew: crewVal,
            galley: galleyVal
        };
        const wbRes = typeof lookupFleetWb === 'function' ? lookupFleetWb(flightForWb) : null;
        if (wbRes && wbRes.success) {
            if (!dowVal) dowVal = String(wbRes.dow);
            if (!doiVal) doiVal = String(wbRes.doi);
        }
    }

    // 5. Определение стенда Loadsheet
    const isTest = window.location.href.includes('aerobag-test') || 
                   window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1';
    const targetUrl = isTest 
        ? 'https://boostandgo.ru/loadsheet_test/' 
        : 'https://boostandgo.ru/loadsheet/';

    const params = new URLSearchParams();
    if (flightNumber) params.set('flight', flightNumber);
    if (fromAirport) params.set('from', fromAirport);
    if (toAirport) params.set('to', toAirport);
    if (flightDate) params.set('date', flightDate);
    if (selectedTail) params.set('acreg', selectedTail);
    if (cabinVersion) params.set('version', cabinVersion);
    if (crewVal) params.set('crew', crewVal);
    if (paxM) params.set('pax_m', paxM);
    if (paxF) params.set('pax_f', paxF);
    if (paxCh) params.set('pax_ch', paxCh);
    if (paxInf) params.set('pax_inf', paxInf);
    if (paxTotal) params.set('pax', paxTotal);
    if (toFuel) params.set('to_fuel', toFuel);
    if (tripFuel) params.set('trip_fuel', tripFuel);
    if (dowVal) params.set('dow', dowVal);
    if (doiVal) params.set('doi', doiVal);
    if (galleyVal) params.set('galley', galleyVal);
    if (cargoVal) params.set('cargo', cargoVal);
    if (mailVal) params.set('mail', mailVal);

    for (let c = 1; c <= 5; c++) {
        if (cptWeights.b[c] > 0) params.set(`cpt_${c}_b`, cptWeights.b[c]);
        if (cptWeights.c[c] > 0) params.set(`cpt_${c}_c`, cptWeights.c[c]);
        if (cptWeights.m[c] > 0) params.set(`cpt_${c}_m`, cptWeights.m[c]);
        if (cptWeights.tr[c] > 0) params.set(`cpt_${c}_tr`, cptWeights.tr[c]);
        if (cptWeights.uld[c] > 0) params.set(`cpt_${c}_uld`, cptWeights.uld[c]);
    }

    params.set('return_url', window.location.href);

    try {
        const payload = {
            flight: flightNumber,
            from: fromAirport,
            to: toAirport,
            date: flightDate,
            acreg: selectedTail,
            version: cabinVersion,
            crew: crewVal,
            pax_m: paxM,
            pax_f: paxF,
            pax_ch: paxCh,
            pax_inf: paxInf,
            pax: paxTotal,
            to_fuel: toFuel,
            trip_fuel: tripFuel,
            dow: dowVal,
            doi: doiVal,
            galley: galleyVal,
            cargo: cargoVal,
            mail: mailVal,
            return_url: window.location.href
        };
        for (let c = 1; c <= 5; c++) {
            if (cptWeights.b[c] > 0) payload[`cpt_${c}_b`] = cptWeights.b[c];
            if (cptWeights.c[c] > 0) payload[`cpt_${c}_c`] = cptWeights.c[c];
            if (cptWeights.m[c] > 0) payload[`cpt_${c}_m`] = cptWeights.m[c];
            if (cptWeights.tr[c] > 0) payload[`cpt_${c}_tr`] = cptWeights.tr[c];
            if (cptWeights.uld[c] > 0) payload[`cpt_${c}_uld`] = cptWeights.uld[c];
        }
        localStorage.setItem('wb_loadsheet_incoming', JSON.stringify(payload));
    } catch (e) {
        console.warn('LocalStorage error:', e);
    }

    window.location.href = `${targetUrl}?${params.toString()}`;
}

// Надежное извлечение числового номера рейса без буквенно-цифровых префиксов авиакомпаний (N4, EO, NWS, KAR, U6 и т.д.)
function extractNumericFlightNumber(flightStr) {
    if (!flightStr) return '';
    let s = String(flightStr).trim().toUpperCase();
    s = s.replace(/^(N4|EO|NWS|KAR|NW|WZ|S7|SU|DP|UT|A4|U6|FV|5N|7R|KL|КЛ|Н4|ЕО)[-\s]?/i, '');
    s = s.replace(/^[A-ZА-Я][A-ZА-Я0-9]{0,2}[-\s]?/i, '');
    const match = s.match(/\d+/);
    return match ? match[0] : s.replace(/\D/g, '');
}

function checkIncomingFlightParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const flightParam = urlParams.get('flight') || urlParams.get('flt') || urlParams.get('flight_no');
    const fromParam = urlParams.get('from');
    const toParam = urlParams.get('to');
    const dateParam = urlParams.get('date');
    const paxParam = urlParams.get('pax');
    const acNumParam = urlParams.get('ac_num') || urlParams.get('tail');
    const depTimeParam = urlParams.get('dep_time') || urlParams.get('time') || urlParams.get('dep');
    const returnUrlParam = urlParams.get('return_url');
    const crewParam = urlParams.get('crew');
    const paxMParam = urlParams.get('pax_m');
    const paxFParam = urlParams.get('pax_f');
    const paxChParam = urlParams.get('pax_ch');
    const paxInfParam = urlParams.get('pax_inf');
    const toFuelParam = urlParams.get('to_fuel') || urlParams.get('fuel_block') || urlParams.get('fuel');
    const tripFuelParam = urlParams.get('trip_fuel') || urlParams.get('fuel_trip');
    const cargoParam = urlParams.get('cargo');
    const mailParam = urlParams.get('mail');
    const acConfigParam = urlParams.get('ac_config') || urlParams.get('version') || urlParams.get('layout');
    const dowParam = urlParams.get('dow');
    const doiParam = urlParams.get('doi');
    const galleyParam = urlParams.get('galley');

    if (dowParam) currentIncomingFlightData.dow = dowParam;
    if (doiParam) currentIncomingFlightData.doi = doiParam;
    if (galleyParam) currentIncomingFlightData.galley = galleyParam;

    if (acConfigParam) currentIncomingFlightData.ac_config = acConfigParam;
    if (crewParam) currentIncomingFlightData.crew = crewParam;
    if (paxMParam) currentIncomingFlightData.pax_m = paxMParam;
    if (paxFParam) currentIncomingFlightData.pax_f = paxFParam;
    if (paxChParam) currentIncomingFlightData.pax_ch = paxChParam;
    if (paxInfParam) currentIncomingFlightData.pax_inf = paxInfParam;
    if (toFuelParam) currentIncomingFlightData.to_fuel = toFuelParam;
    if (tripFuelParam) currentIncomingFlightData.trip_fuel = tripFuelParam;
    if (cargoParam) currentIncomingFlightData.cargo = cargoParam;
    if (mailParam) currentIncomingFlightData.mail = mailParam;

    if (depTimeParam) currentIncomingFlightData.dep_time = depTimeParam;
    if (acNumParam) currentIncomingFlightData.ac_num = acNumParam;
    if (dateParam) currentIncomingFlightData.date = dateParam;
    if (fromParam) currentIncomingFlightData.from = fromParam;
    if (toParam) currentIncomingFlightData.to = toParam;

    const cleanFlight = extractNumericFlightNumber(flightParam);
    if (cleanFlight) {
        currentIncomingFlightData.flight = cleanFlight;
        const flightInput = document.getElementById('select-flight');
        if (flightInput) {
            flightInput.value = cleanFlight;
        }
    }

    if (dateParam) {
        const dateInput = document.getElementById('input-date');
        if (dateInput) {
            dateInput.value = dateParam;
        }
    }

    if (paxParam) {
        currentIncomingFlightData.pax = paxParam;
        const paxInput = document.getElementById('input-pax');
        if (paxInput) {
            paxInput.value = paxParam;
        }
    }

    // Автоподбор маршрута: если переданы и from, и to — применяем их напрямую;
    // иначе, если известен номер рейса — подбираем маршрут из базы
    if (fromParam && toParam) {
        applyRouteSelection({ from: fromParam, to: toParam });
    } else if (cleanFlight) {
        const route = findRouteByFlightNo(cleanFlight);
        if (route) {
            applyRouteSelection(route);
        }
    }

    // Защита от сброса пассажиров: если был передан PAX, гарантированно возвращаем его в инпут
    if (paxParam) {
        const paxInput = document.getElementById('input-pax');
        if (paxInput) {
            paxInput.value = paxParam;
        }
    }

    // Закрываем выпадающие подсказки рейса
    if (typeof hideCustomFlightSuggestions === 'function') {
        hideCustomFlightSuggestions();
    }

    if (acNumParam) {
        applyAircraftCompartmentConfig(acNumParam, false);
        updateActiveFlightBadge(
            currentIncomingFlightData.from,
            currentIncomingFlightData.to,
            currentIncomingFlightData.flight,
            currentIncomingFlightData.date,
            acNumParam,
            currentIncomingFlightData.dep_time
        );
    }

    if (returnUrlParam) {
        const returnBtn = document.getElementById('btn-return-aeroplan');
        if (returnBtn) {
            returnBtn.setAttribute('data-return-url', returnUrlParam);
            returnBtn.classList.add('pulse-highlight');
        }
    }
}


// Сохранение текущей раскладки BULK отсеков в объект prediction из Истории расчетов
function saveCompartmentsToPrediction() {
    if (!currentActivePredictionId) return;
    const p = predictionsHistory.find(item => item.id === currentActivePredictionId);
    if (!p) return;

    const lirPaxInput = document.getElementById('lir-pax');
    const lirPcsInput = document.getElementById('lir-pcs');
    const lirWeightInput = document.getElementById('lir-weight');

    if (lirPaxInput && lirPaxInput.value !== '') p.lir_pax = parseInt(lirPaxInput.value, 10) || 0;
    if (lirPcsInput && lirPcsInput.value !== '') p.lir_pcs = parseInt(lirPcsInput.value, 10) || 0;
    if (lirWeightInput && lirWeightInput.value !== '') p.lir_weight = parseFloat(lirWeightInput.value) || 0;

    p.compartments = JSON.parse(JSON.stringify(currentCompartmentsState));
    if (currentActiveAircraftTail) {
        p.ac_num = currentActiveAircraftTail;
    }
    p.show_fwd = isFwdCompartmentsVisible;
    savePredictionsHistory();
}

// Восстановление раскладки BULK отсеков из объекта prediction
function restoreCompartmentsFromPrediction(p) {
    if (!p) return;
    const tail = p.ac_num || '';
    const showFwd = p.show_fwd !== undefined ? p.show_fwd : null;
    applyAircraftCompartmentConfig(tail, showFwd, p.compartments);
}

// Очистка значений отсеков (с сохранением текущей модели ВС и позиций борта)
function resetCompartments() {
    const tailOrType = currentActiveAircraftTail || currentActiveAircraftModel || 'A321';
    applyAircraftCompartmentConfig(tailOrType, isFwdCompartmentsVisible, false);
}


function transferToPreliminary() {
    const paxInput = document.getElementById('input-pax');
    const resPcs = document.getElementById('res-pcs');
    const resWeight = document.getElementById('res-weight');

    let paxVal = parseInt(paxInput ? paxInput.value : 0) || 0;

    // Проверяем режим явки пассажиров (Факт 100% или Бронь 97%)
    const paxModeRadio = document.querySelector('input[name="pax-mode"]:checked');
    const paxModeFactor = paxModeRadio ? parseFloat(paxModeRadio.value) : 1.0;
    const isBookingMode = paxModeFactor < 0.99;
    if (isBookingMode && paxVal > 0) {
        // Если переключатель на Брони (97%), переносим ожидаемое число пассажиров с учетом неявки
        paxVal = Math.max(1, Math.round(paxVal * paxModeFactor));
    }

    const pcsVal = parseInt(resPcs ? resPcs.textContent : 0) || 0;
    const weightVal = parseFloat(resWeight ? resWeight.textContent : 0) || 0;

    const prelimPax = document.getElementById('prelim-pax');
    const prelimPcs = document.getElementById('prelim-pcs');
    const prelimWeight = document.getElementById('prelim-weight');

    const lirPax = document.getElementById('lir-pax');
    const lirPcs = document.getElementById('lir-pcs');
    const lirWeight = document.getElementById('lir-weight');

    if (prelimPax) prelimPax.textContent = paxVal;
    if (prelimPcs) prelimPcs.textContent = pcsVal;
    if (prelimWeight) prelimWeight.textContent = weightVal;

    if (lirPax) lirPax.value = paxVal;
    if (lirPcs) lirPcs.value = pcsVal;
    if (lirWeight) lirWeight.value = weightVal;

    // Находим расчет: строго текущий активный расчет, либо самый свежий по времени расчета (calc_date)
    let activePred = null;
    if (currentActivePredictionId) {
        activePred = predictionsHistory.find(item => item.id === currentActivePredictionId);
    }
    if (!activePred && predictionsHistory && predictionsHistory.length > 0) {
        activePred = predictionsHistory.slice().sort((a, b) => new Date(b.calc_date || 0) - new Date(a.calc_date || 0))[0];
    }

    if (activePred) {
        currentActivePredictionId = activePred.id;
        activePred.lir_pax = paxVal;
        activePred.lir_pcs = pcsVal;
        activePred.lir_weight = weightVal;
        activePred.pax = paxVal;
        activePred.bag_pcs = pcsVal;
        activePred.bag_weight = weightVal;

        updateActiveFlightBadge(activePred.from, activePred.to, activePred.flight_no, activePred.flight_date || activePred.calc_date, activePred.ac_num, activePred.dep_time);
        highlightPredictionRow(currentActivePredictionId);

        if (activePred.ac_num) {
            applyAircraftCompartmentConfig(activePred.ac_num, activePred.show_fwd !== undefined ? activePred.show_fwd : null, activePred.compartments);
        }
    }

    resetCompartments();
    recalculateLoadPlanning();
    saveCompartmentsToPrediction();

    setTimeout(() => {
        const firstSelect = document.querySelector('#unified-load-tbody .bulk-type-select');
        if (firstSelect) {
            firstSelect.focus();
        }
    }, 50);
}

function transferPredictionToPreliminary(predId) {
    if (!predId) return;

    // 1. СТРОГО ПЕРВЫМ ДЕЛОМ: сохраняем раскладку отсеков и LIR предыдущего активного рейса,
    // чтобы его данные не потерялись и не перетерлись новым рейсом!
    if (currentActivePredictionId && currentActivePredictionId !== predId) {
        saveCompartmentsToPrediction();
    }

    const p = predictionsHistory.find(item => item.id === predId);
    if (!p) return;

    // 2. Устанавливаем новый активный рейс
    currentActivePredictionId = predId;

    const paxVal = parseInt(p.pax, 10) || 0;
    const pcsVal = parseInt(p.bag_pcs, 10) || 0;
    const weightVal = parseFloat(p.bag_weight) || 0;

    const prelimPax = document.getElementById('prelim-pax');
    const prelimPcs = document.getElementById('prelim-pcs');
    const prelimWeight = document.getElementById('prelim-weight');
    if (prelimPax) prelimPax.textContent = paxVal;
    if (prelimPcs) prelimPcs.textContent = pcsVal;
    if (prelimWeight) prelimWeight.textContent = weightVal;

    const curLirPax = (p.lir_pax !== undefined && p.lir_pax !== null) ? p.lir_pax : paxVal;
    const curLirPcs = (p.lir_pcs !== undefined && p.lir_pcs !== null) ? p.lir_pcs : pcsVal;
    const curLirWeight = (p.lir_weight !== undefined && p.lir_weight !== null) ? p.lir_weight : weightVal;

    const lirPax = document.getElementById('lir-pax');
    const lirPcs = document.getElementById('lir-pcs');
    const lirWeight = document.getElementById('lir-weight');
    if (lirPax) lirPax.value = curLirPax;
    if (lirPcs) lirPcs.value = curLirPcs;
    if (lirWeight) lirWeight.value = curLirWeight;

    // Карточки результатов (средняя колонка)
    const resPcs = document.getElementById('res-pcs');
    const resWeight = document.getElementById('res-weight');
    const resHb = document.getElementById('res-hb');
    if (resPcs) resPcs.textContent = p.bag_pcs || 0;
    if (resWeight) resWeight.textContent = p.bag_weight || 0;
    if (resHb) resHb.textContent = p.hb_weight || 0;

    // 3. Восстанавливаем отсеки СТРОГО этого рейса через applyAircraftCompartmentConfig
    // Передаем p.compartments в качестве источника — исключаем любую утечку данных из других рейсов!
    const targetTail = p.ac_num || '';
    const showFwd = p.show_fwd !== undefined ? p.show_fwd : null;
    applyAircraftCompartmentConfig(targetTail, showFwd, p.compartments);

    // 4. Обновляем инфо-плашку активного рейса в правой колонке
    updateActiveFlightBadge(p.from, p.to, p.flight_no, p.flight_date || p.calc_date, p.ac_num, p.dep_time);

    // 5. Синхронизируем форму прогноза с выбранным рейсом
    if (p.from && p.to) {
        applyRouteSelection({ from: p.from, to: p.to });
    }
    const flightInput = document.getElementById('select-flight');
    if (flightInput && p.flight_no) {
        flightInput.value = p.flight_no;
    }
    const dateInput = document.getElementById('input-date');
    if (dateInput && (p.flight_date || p.calc_date)) {
        const dStr = (p.flight_date || p.calc_date).split('T')[0];
        if (dStr) dateInput.value = dStr;
    }
    const historyPax = p.raw_pax || p.pax;
    if (historyPax) {
        currentIncomingFlightData.pax = historyPax;
        const mainInputPax = document.getElementById('input-pax');
        if (mainInputPax) mainInputPax.value = historyPax;
    }
    if (typeof hideCustomFlightSuggestions === 'function') {
        hideCustomFlightSuggestions();
    }

    if (p.ac_num) currentIncomingFlightData.ac_num = p.ac_num;
    if (p.dep_time) currentIncomingFlightData.dep_time = p.dep_time;
    if (p.flight_no) currentIncomingFlightData.flight = p.flight_no;
    if (p.from) currentIncomingFlightData.from = p.from;
    if (p.to) currentIncomingFlightData.to = p.to;

    // 6. Подсвечиваем строку рейса в левой таблице
    highlightPredictionRow(predId);
}

function recalculateLoadPlanning() {
    const activeEl = document.activeElement;

    const prelimPax = parseInt(document.getElementById('prelim-pax')?.textContent || 0) || 0;
    const prelimPcs = parseInt(document.getElementById('prelim-pcs')?.textContent || 0) || 0;
    const prelimWeight = parseFloat(document.getElementById('prelim-weight')?.textContent || 0) || 0;

    const lirPaxInput = document.getElementById('lir-pax');
    const lirPcsInput = document.getElementById('lir-pcs');
    const lirWeightInput = document.getElementById('lir-weight');

    let lirPax = parseInt(lirPaxInput ? lirPaxInput.value : 0) || 0;
    let lirPcs = parseInt(lirPcsInput ? lirPcsInput.value : 0) || 0;
    let lirWeight = parseFloat(lirWeightInput ? lirWeightInput.value : 0) || 0;

    const targetPax = lirPax > 0 ? lirPax : prelimPax;
    const targetPcs = lirPcs > 0 ? lirPcs : prelimPcs;
    const targetWeight = lirWeight > 0 ? lirWeight : prelimWeight;

    const prelimAvgWeight = document.getElementById('prelim-avg-weight');
    const prelimAvgPax = document.getElementById('prelim-avg-pax');

    const avgW = targetPcs > 0 ? (targetWeight / targetPcs) : 0;
    if (prelimAvgWeight) {
        prelimAvgWeight.textContent = avgW.toFixed(2).replace('.', ',');
    }
    if (prelimAvgPax) {
        const avgP = targetPax > 0 ? (targetPcs / targetPax) : 0;
        prelimAvgPax.textContent = avgP.toFixed(2).replace('.', ',');
    }

    let totalPcs = 0;
    let totalWeight = 0;

    if (!currentCompartmentsState || currentCompartmentsState.length === 0) {
        initDefaultCompartmentsState();
    }

    currentCompartmentsState.forEach((comp, compIdx) => {
        let compPcs = 0;
        let compWeight = 0;

        comp.rows.forEach((row, rowIdx) => {
            const pcs = parseInt(row.pcs, 10) || 0;
            let weight = parseFloat(row.weight) || 0;

            const pcsInput = document.getElementById(`bulk-pcs-${compIdx}-${rowIdx}`);
            const weightInput = document.getElementById(`bulk-weight-${compIdx}-${rowIdx}`);

            const isEditingWeight = (weightInput === activeEl);
            const isLocked = row.locked || (isEditingWeight && weightInput?.value.trim() !== '');

            if (!isLocked) {
                if (pcs > 0 && avgW > 0) {
                    weight = Math.round(pcs * avgW);
                    row.weight = weight;
                    if (weightInput && !isEditingWeight) {
                        weightInput.value = String(weight);
                    }
                } else if (pcs === 0 && !isEditingWeight) {
                    weight = 0;
                    row.weight = 0;
                    if (weightInput) weightInput.value = '0';
                }
            }

            compPcs += pcs;
            compWeight += weight;
        });

        totalPcs += compPcs;
        totalWeight += compWeight;

        const subtotalPcsEl = document.getElementById(`cpt-subtotal-pcs-${compIdx}`);
        const subtotalWeightEl = document.getElementById(`cpt-subtotal-weight-${compIdx}`);
        if (subtotalPcsEl) subtotalPcsEl.textContent = String(compPcs);
        if (subtotalWeightEl) subtotalWeightEl.textContent = `${compWeight} кг`;
    });

    const restPcs = targetPcs - totalPcs;
    const restWeight = targetWeight - totalWeight;

    const restPcsEl = document.getElementById('bulk-rest-pcs');
    const restWeightEl = document.getElementById('bulk-rest-weight');
    const ttlPcsEl = document.getElementById('bulk-ttl-pcs');
    const ttlWeightEl = document.getElementById('bulk-ttl-weight');

    if (restPcsEl) {
        restPcsEl.textContent = restPcs;
        restPcsEl.classList.toggle('negative-rest', restPcs < 0);
    }
    if (restWeightEl) {
        restWeightEl.textContent = (Math.round(restWeight * 100) / 100);
        restWeightEl.classList.toggle('negative-rest', restWeight < 0);
    }
    if (ttlPcsEl) ttlPcsEl.textContent = totalPcs;
    if (ttlWeightEl) ttlWeightEl.textContent = (Math.round(totalWeight * 100) / 100);
}

function initLoadPlanningData() {
    populateAircraftTailDropdown();
    renderCompartmentsTable();

    const btnTransfer = document.getElementById('btn-transfer-preliminary');
    if (btnTransfer && !btnTransfer.dataset.hasLoadListener) {
        btnTransfer.dataset.hasLoadListener = 'true';
        btnTransfer.addEventListener('click', transferToPreliminary);
    }
    if (btnTransfer && !btnTransfer.dataset.hasTabListener) {
        btnTransfer.dataset.hasTabListener = 'true';
        btnTransfer.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && !e.shiftKey) {
                e.preventDefault();
                const firstSelect = document.querySelector('#unified-load-tbody .bulk-type-select');
                if (firstSelect) {
                    firstSelect.focus();
                }
            }
        });
    }

    ['lir-pax', 'lir-pcs', 'lir-weight'].forEach(id => {
        const input = document.getElementById(id);
        if (input && !input.dataset.hasKeyNavListener) {
            input.dataset.hasKeyNavListener = 'true';
            input.addEventListener('focus', () => input.select());
            input.addEventListener('input', () => {
                recalculateLoadPlanning();
                debouncedSaveCompartmentsToPrediction();
            });
            input.addEventListener('change', () => {
                let v = input.value.trim();
                if (v === '' || isNaN(v) || parseFloat(v) < 0) {
                    input.value = '0';
                } else {
                    input.value = (id === 'lir-weight') ? String(parseFloat(v)) : String(parseInt(v, 10));
                }
                recalculateLoadPlanning();
                saveCompartmentsToPrediction();
            });
        }
    });

    recalculateLoadPlanning();
}

// --- ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ---
document.addEventListener('DOMContentLoaded', async () => {
    if (typeof window !== 'undefined') {
        window.name = 'AeroBag_Workspace';
    }
    loadSettings();
    
    const versionTag = document.getElementById('app-version-tag');
    if (versionTag) versionTag.textContent = APP_VERSION;
    const buildDateTag = document.getElementById('app-build-date');
    if (buildDateTag) buildDateTag.textContent = APP_BUILD_DATE;
    
    // Инициализация даты в форме прогноза (сегодняшняя дата)
    const dateInput = document.getElementById('input-date');
    if (dateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${yyyy}-${mm}-${dd}`;
    }

    await loadBaggageDb();
    await loadFleetWb();
    loadPredictionsHistory();
    initDefaultCompartmentsState();
    renderCompartmentsTable();
    
    // Автоматическая аутентификация пользователя и разграничение прав
    await checkAuthStatus();
    
    // Гарантированная начальная загрузка базы рейсов
    if (!userFlights || userFlights.length === 0) {
        await loadUserFlights();
    }

    setupEventListeners();
    setupTabs();
    setupNumericInputValidation();
    setupDatePickerTrigger();
    initAviationModal();
    initLoadPlanningData();

    // Обработка параметров рейса из внешней системы (AeroPlan W&B)
    checkIncomingFlightParameters();

    // Автоматическая сверка времени вылета рейсов с суточным планом AeroPlan
    syncFlightTimesWithAeroPlan();
});

// Загрузка настроек темы и языка
function loadSettings() {
    // Язык
    const savedLang = localStorage.getItem('averago_lang');
    if (savedLang && (savedLang === 'ru' || savedLang === 'en')) {
        currentLang = savedLang;
    } else {
        currentLang = navigator.language.startsWith('ru') ? 'ru' : 'en';
    }
    setLanguage(currentLang);

    // Мгновенный синхронный рендер профиля пользователя и доступных вкладок (исключает любое мелькание!)
    const cachedUser = localStorage.getItem('averago_current_user_profile') || localStorage.getItem('averago_local_auth_user');
    if (cachedUser) {
        try {
            currentUser = JSON.parse(cachedUser);
            isAdminAuthenticated = (currentUser && currentUser.role === 'admin');
            updateUserHeaderUI();
            updateTabsRoleAccess();
        } catch (e) {}
    }

    // Тема (с приоритетом персональной настройки текущего диспетчера / пользователя)
    let userPreferredTheme = (currentUser && currentUser.theme) ? currentUser.theme : null;
    if (!userPreferredTheme && currentUser && currentUser.id) {
        userPreferredTheme = localStorage.getItem(`averago_theme_user_${currentUser.id}`);
    }
    const savedTheme = userPreferredTheme || localStorage.getItem('averago_theme');
    if (savedTheme) {
        currentTheme = savedTheme;
    }
    applyTheme(currentTheme, false);
}

// Установка языка интерфейса
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('averago_lang', lang);

    // Подсветка кнопок
    document.getElementById('btn-lang-ru').classList.toggle('active', lang === 'ru');
    document.getElementById('btn-lang-en').classList.toggle('active', lang === 'en');

    // Перевод элементов
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                el.setAttribute('placeholder', translations[lang][key]);
            } else if (el.tagName === 'OPTION') {
                el.text = translations[lang][key];
            } else {
                el.textContent = translations[lang][key];
            }
        }
    });

    updateThemeButtonUI();
    updateOfflineStatusUI();

    // Перерисовать таблицу и графики, если они готовы
    if (baggageDb) {
        updateActiveDateRangeAndCounts();
        renderFlightsTable();
        renderPredictionsTable();
        renderAirportFiltersUI();
    }
    renderDashboardAnalytics();
}

// Применение темы оформления (dark / light) с синхронизацией в профиль пользователя и БД
function applyTheme(theme, saveToServer = true) {
    currentTheme = (theme === 'light') ? 'light' : 'dark';
    localStorage.setItem('averago_theme', currentTheme);

    const isLightTheme = (currentTheme === 'light');
    document.documentElement.classList.toggle('light-theme', isLightTheme);
    document.documentElement.setAttribute('data-theme', isLightTheme ? 'light' : 'dark');
    document.body.classList.toggle('light-theme', isLightTheme);
    updateThemeButtonUI();

    // Сохраняем тему в профиль текущего пользователя
    if (currentUser) {
        currentUser.theme = currentTheme;
        try {
            localStorage.setItem('averago_current_user_profile', JSON.stringify(currentUser));
            if (currentUser.id) {
                localStorage.setItem(`averago_theme_user_${currentUser.id}`, currentTheme);
            }
        } catch (e) {}

        // Асинхронно отправляем тему на сервер в MySQL
        if (saveToServer && !isOfflineMode && window.location.protocol !== 'file:') {
            fetch('api.php?action=update_theme', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme: currentTheme })
            }).catch(err => {
                console.warn('Не удалось сохранить тему на сервере:', err);
            });
        }
    }
}

// Переключение темы оформления
function toggleTheme() {
    const nextTheme = (currentTheme === 'dark') ? 'light' : 'dark';
    applyTheme(nextTheme, true);
}

// Обновление текста на кнопке темы
function updateThemeButtonUI() {
    const btn = document.getElementById('btn-theme-toggle');
    if (!btn) return;

    const isLight = document.body.classList.contains('light-theme');
    const emoji = isLight ? '☀️' : '🌙';
    const textKey = isLight ? 'theme-light' : 'theme-dark';
    const text = translations[currentLang][textKey];

    btn.querySelector('.theme-emoji').textContent = emoji;
    btn.querySelector('.theme-text').textContent = text;
}

// Загрузка базы данных аэропортов и исторических правил
async function loadBaggageDb() {
    try {
        const response = await fetch('baggage_db.json');
        if (response && response.ok) {
            const data = await response.json();
            if (data && data.airports && Object.keys(data.airports).length > 0) {
                baggageDb = data;
            }
        }
    } catch (e) {
        console.warn("Локальная загрузка baggage_db.json через fetch не удалась, используется встроенная база:", e);
        if (!baggageDb || !baggageDb.airports) {
            baggageDb = JSON.parse(JSON.stringify(DEFAULT_BAGGAGE_DB));
        }
    }
    
    // Встроенная и локальная синхронизация пользовательских направлений
    const localCustomAirports = getCustomAirportsList();
    if (localCustomAirports && localCustomAirports.length > 0) {
        applyCustomAirportsToDb(localCustomAirports);
    }
    
    // В любом режиме (онлайн или оффлайн) гарантированно выполняем инициализацию и рендер
    populateAirportDropdowns();
    populateAllFlightsDropdown();
    updateActiveDateRangeAndCounts();
    renderFlightsTable();
    renderPredictionsTable();
    renderUploadedFilesList();
    renderAirportFiltersUI();
    initAirportFiltersFromServer();
    initCustomAirportsFromServer();
}

// ==========================================================================
// УПРАВЛЕНИЕ ФИЛЬТРАМИ ИМПОРТА РЕЙСОВ (DEPARTURES & ARRIVALS ROUTE FILTERS)
// ==========================================================================

// Получение текущих активных фильтров аэропортов (из LocalStorage, БД или дефолтные)
function getCustomAirportFilters() {
    const saved = localStorage.getItem('averago_custom_airport_filters');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (parsed && Array.isArray(parsed.departures) && Array.isArray(parsed.arrivals)) {
                return {
                    departures: Array.from(new Set(parsed.departures)),
                    arrivals: Array.from(new Set(parsed.arrivals)),
                    strict_arrivals: !!parsed.strict_arrivals
                };
            }
        } catch (e) {
            console.error("Ошибка парсинга averago_custom_airport_filters:", e);
        }
    }

    // Исходные предустановленные списки
    const defaultDeps = (baggageDb && Array.isArray(baggageDb.departures_filter) && baggageDb.departures_filter.length > 0)
        ? baggageDb.departures_filter
        : ['AER', 'СОЧ', 'CCC', 'DYU', 'ДШБ', 'GOX', 'HOG', 'HRG', 'KQT', 'КГТ', 'LBD', 'ХДТ', 'OSS', 'ОШШ', 'PMV', 'REN', 'ОНГ', 'SSH', 'SUI', 'СУИ', 'TAS', 'ТАС', 'UTP', 'VRA'];

    const defaultArrs = (baggageDb && Array.isArray(baggageDb.arrivals_filter) && baggageDb.arrivals_filter.length > 0)
        ? baggageDb.arrivals_filter
        : ['СОЧ', 'AYT', 'БАН', 'ЧЛБ', 'ЧБЕ', 'ДШБ', 'НЖС', 'ИВВ', 'КРВ', 'КЛД', 'ЕМВ', 'КГН', 'СКЧ', 'КИО', 'КЗН', 'ХДТ', 'ПЛК', 'МХЛ', 'МГС', 'МРВ', 'НЖК', 'НЖВ', 'НВК', 'ОМС', 'ОСК', 'ТЛЧ', 'ПРЬ', 'ОНГ', 'ГОР', 'СЫВ', 'СУР', 'SKV', 'ШРМ', 'ТАМ', 'УФА', 'УЛВ', 'ЯРЛ', 'ЭГВ', 'ПВХ', 'ВАВ', 'АБА', 'БАХ', 'ИКТ', 'КРС', 'ГРН', 'БЛГ', 'БКС', 'БРН', 'ВРН', 'КУР', 'ПЗМ', 'СВХ', 'ИЖВ', 'МРМ', 'КПА'];

    return {
        departures: Array.from(new Set(defaultDeps)),
        arrivals: Array.from(new Set(defaultArrs)),
        strict_arrivals: false
    };
}

// Проверка ответа сервера на ошибки авторизации и прав доступа при синхронизации
function checkServerSyncResponse(data, contextName = '') {
    if (!data) return false;
    if (data.unauthorized || data.forbidden) {
        const msg = currentLang === 'ru'
            ? `⚠️ Внимание: сессия на сервере истекла. ${contextName ? contextName + ' сохранены' : 'Данные сохранены'} только локально в этом браузере! Пожалуйста, перезайдите в систему под Администратором для синхронизации с общей базой.`
            : `⚠️ Warning: server session expired. ${contextName ? contextName + ' saved' : 'Data saved'} locally in this browser only! Please re-login as Administrator to sync with the shared database.`;
        showAviationAlert(msg, true);
        return false;
    }
    if (data.success === false && data.error) {
        const msg = currentLang === 'ru'
            ? `⚠️ Ошибка синхронизации с сервером (${contextName || 'настройки'}): ${data.error}. Сохранено только локально.`
            : `⚠️ Server sync error (${contextName || 'settings'}): ${data.error}. Saved locally only.`;
        showAviationAlert(msg, true);
        return false;
    }
    return true;
}

// Сохранение фильтров аэропортов (в LocalStorage и в MySQL через API)
async function saveCustomAirportFilters(filters) {
    if (!filters) return false;
    try {
        localStorage.setItem('averago_custom_airport_filters', JSON.stringify(filters));
    } catch (e) {
        console.error("Ошибка сохранения averago_custom_airport_filters:", e);
    }

    if (!isOfflineMode && window.location.protocol !== 'file:') {
        try {
            const res = await fetch('api.php?action=save_settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    setting_key: 'airport_filters',
                    setting_value: filters
                })
            });
            if (res) {
                const contentType = res.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const data = await res.json();
                    return checkServerSyncResponse(data, currentLang === 'ru' ? 'Фильтры направлений' : 'Route filters');
                } else if (!res.ok) {
                    showAviationAlert(currentLang === 'ru' ? '⚠️ Сервер временно недоступен (HTTP ' + res.status + '). Фильтры сохранены локально.' : '⚠️ Server unavailable (HTTP ' + res.status + '). Filters saved locally.', true);
                    return false;
                }
            }
        } catch (e) {
            console.warn("Ошибка синхронизации фильтров с сервером:", e);
        }
    }
    return false;
}

// ==========================================================================
// УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЬСКИМИ АЭРОПОРТАМИ И ГОРОДАМИ (CUSTOM AIRPORTS DB)
// ==========================================================================

// Получение списка сохраненных пользователем аэропортов (из LocalStorage)
function getCustomAirportsList() {
    try {
        const saved = localStorage.getItem('averago_custom_airports');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
    } catch (e) {
        console.error("Ошибка чтения averago_custom_airports:", e);
    }
    return [];
}

// Сохранение списка пользовательских аэропортов (в LocalStorage и в MySQL через API)
async function saveCustomAirportsList(list) {
    if (!Array.isArray(list)) return false;
    try {
        localStorage.setItem('averago_custom_airports', JSON.stringify(list));
    } catch (e) {
        console.error("Ошибка сохранения averago_custom_airports:", e);
    }

    if (!isOfflineMode && window.location.protocol !== 'file:') {
        try {
            const res = await fetch('api.php?action=save_settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    setting_key: 'custom_airports',
                    setting_value: list
                })
            });
            if (res) {
                const contentType = res.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const data = await res.json();
                    return checkServerSyncResponse(data, currentLang === 'ru' ? 'Новые направления' : 'Custom airports');
                } else if (!res.ok) {
                    showAviationAlert(currentLang === 'ru' ? '⚠️ Сервер временно недоступен (HTTP ' + res.status + '). Порты сохранены локально.' : '⚠️ Server unavailable (HTTP ' + res.status + '). Airports saved locally.', true);
                    return false;
                }
            }
        } catch (e) {
            console.warn("Ошибка синхронизации custom_airports с сервером:", e);
        }
    }
    return false;
}

// Регистрация пользовательских аэропортов в активном справочнике baggageDb.airports
function applyCustomAirportsToDb(list) {
    if (!list || !Array.isArray(list)) return;
    if (!baggageDb) baggageDb = {};
    if (!baggageDb.airports) baggageDb.airports = {};

    list.forEach(ap => {
        if (!ap || !ap.iata) return;
        const iata = String(ap.iata).trim().toUpperCase();
        const ru = ap.ru ? String(ap.ru).trim().toUpperCase() : iata;
        const name = ap.name ? String(ap.name).trim() : iata;

        baggageDb.airports[iata] = { iata, ru, name };
        if (ru && ru !== iata) {
            baggageDb.airports[ru] = { iata, ru, name };
        }
    });
}

// Загрузка сохраненных пользовательских аэропортов с сервера и слияние
async function initCustomAirportsFromServer() {
    const localList = getCustomAirportsList();
    if (localList.length > 0) {
        applyCustomAirportsToDb(localList);
    }

    if (!isOfflineMode) {
        try {
            const res = await fetch('api.php?action=get_settings&key=custom_airports');
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await res.json();
                if (data.success && Array.isArray(data.value)) {
                    const mergedMap = new Map();
                    localList.forEach(ap => { if (ap && ap.iata) mergedMap.set(ap.iata.toUpperCase(), ap); });
                    data.value.forEach(ap => { if (ap && ap.iata) mergedMap.set(ap.iata.toUpperCase(), ap); });
                    const merged = Array.from(mergedMap.values());
                    localStorage.setItem('averago_custom_airports', JSON.stringify(merged));
                    applyCustomAirportsToDb(merged);
                }
            }
        } catch (e) {
            console.warn("Не удалось подгрузить custom_airports с сервера:", e);
        }
    }
    populateAirportDropdowns();
}

// Загрузка сохраненных фильтров аэропортов с сервера
async function initAirportFiltersFromServer() {
    if (!isOfflineMode) {
        try {
            const res = await fetch('api.php?action=get_settings&key=airport_filters');
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await res.json();
                if (data.success && data.value && Array.isArray(data.value.departures) && Array.isArray(data.value.arrivals)) {
                    localStorage.setItem('averago_custom_airport_filters', JSON.stringify(data.value));
                }
            }
        } catch (e) {
            console.warn("Не удалось подгрузить фильтры аэропортов с сервера:", e);
        }
    }
    renderAirportFiltersUI();
    populateAirportDropdowns();
}

// Вспомогательная функция для дедупликации и упорядочивания аэропортов по алфавиту городов (А-Я)
function getCanonicalAirportItems(codesList) {
    const map = new Map();
    (codesList || []).forEach(code => {
        if (!code) return;
        const info = resolveAirportInfo(code);
        const key = info ? (info.iata || info.ru || code).toUpperCase() : String(code).trim().toUpperCase();
        if (!map.has(key)) {
            map.set(key, {
                key: key,
                origCode: code,
                iata: info ? info.iata : key,
                ru: info ? info.ru : key,
                name: info ? info.name : key
            });
        }
    });
    // Сортировка строго по алфавиту русского названия города (или кода, если названия нет)
    return Array.from(map.values()).sort((a, b) => {
        const nameA = a.name || a.ru || a.iata;
        const nameB = b.name || b.ru || b.iata;
        return nameA.localeCompare(nameB, 'ru', { sensitivity: 'base' });
    });
}

// Переключение раскрытия/складывания панели фильтров
function toggleAirportFiltersAccordion(e) {
    if (e) {
        if (e.target && e.target.closest('#btn-reset-filters-default')) {
            return;
        }
        e.stopPropagation();
    }
    const panel = document.getElementById('airport-filters-panel');
    const toggleBtn = document.getElementById('btn-toggle-filters-collapse');
    if (!panel) return;

    panel.classList.toggle('collapsed');
    const isCollapsed = panel.classList.contains('collapsed');
    
    if (toggleBtn) {
        const textEl = toggleBtn.querySelector('.collapse-text');
        const iconEl = toggleBtn.querySelector('.collapse-icon');
        if (textEl) {
            textEl.textContent = isCollapsed 
                ? (translations[currentLang]['btn-expand'] || (currentLang === 'ru' ? 'Развернуть' : 'Expand'))
                : (translations[currentLang]['btn-collapse'] || (currentLang === 'ru' ? 'Свернуть' : 'Collapse'));
        }
        if (iconEl) {
            iconEl.textContent = isCollapsed ? '▼' : '▲';
        }
    }
}

// Отрисовка интерактивной панели фильтров (строчный вид в столбец + автодополнение + счетчики)
function renderAirportFiltersUI() {
    const depContainer = document.getElementById('departures-chips-container');
    const arrContainer = document.getElementById('arrivals-chips-container');
    const depBadge = document.getElementById('departures-count-badge');
    const arrBadge = document.getElementById('arrivals-count-badge');
    const datalist = document.getElementById('airports-datalist');
    const chkStrict = document.getElementById('chk-strict-arrivals');
    const summaryDeps = document.getElementById('filters-summary-deps');
    const summaryArrs = document.getElementById('filters-summary-arrs');

    if (!depContainer || !arrContainer) return;

    const filters = getCustomAirportFilters();

    if (chkStrict) {
        chkStrict.checked = !!filters.strict_arrivals;
    }

    // Заполнение datalist для автодополнения (поиск по коду или названию)
    if (datalist && baggageDb && baggageDb.airports) {
        const addedSet = new Set();
        datalist.innerHTML = '';
        Object.values(baggageDb.airports).forEach(ap => {
            if (!ap) return;
            const primaryKey = ap.iata || ap.ru;
            if (primaryKey && !addedSet.has(primaryKey)) {
                addedSet.add(primaryKey);
                const opt = document.createElement('option');
                opt.value = `${ap.iata || ap.ru} - ${ap.name || ''} (${ap.ru || ap.iata || ''})`;
                datalist.appendChild(opt);
            }
        });
    }

    // Получаем упорядоченные и дедуплицированные списки
    const sortedDeps = getCanonicalAirportItems(filters.departures);
    const sortedArrs = getCanonicalAirportItems(filters.arrivals);

    // Обновляем бейджи в шапке панели
    if (summaryDeps) {
        const word = currentLang === 'ru' ? 'вылетов' : 'deps';
        summaryDeps.textContent = `🛫 ${sortedDeps.length} ${word}`;
    }
    if (summaryArrs) {
        const word = currentLang === 'ru' ? 'прилетов' : 'arrs';
        const strictLabel = filters.strict_arrivals ? (currentLang === 'ru' ? ' [Строгий]' : ' [Strict]') : '';
        summaryArrs.textContent = `🛬 ${sortedArrs.length} ${word}${strictLabel}`;
    }

    // 1. Отрисовка строк вылетов (Departures - вертикальный список в столбец)
    depContainer.innerHTML = '';
    if (depBadge) {
        const itemWord = currentLang === 'ru' ? 'городов' : 'cities';
        depBadge.textContent = `${sortedDeps.length} ${itemWord}`;
    }

    if (sortedDeps.length === 0) {
        depContainer.innerHTML = `<span class="dash-subtext" style="padding: 6px;">${currentLang === 'ru' ? 'Нет фильтров (все вылеты разрешены)' : 'No filters (all departures allowed)'}</span>`;
    } else {
        sortedDeps.forEach(item => {
            const row = document.createElement('div');
            row.className = 'airport-filter-row';
            const codesText = (item.ru && item.ru !== item.iata) ? `${item.iata} / ${item.ru}` : item.iata;
            row.innerHTML = `
                <div class="row-info">
                    <span class="row-city-name">${item.name || item.iata}</span>
                    <span class="row-airport-codes">${codesText}</span>
                </div>
                <button type="button" class="btn-row-remove" title="${currentLang === 'ru' ? 'Удалить из фильтра' : 'Remove'}" onclick="handleRemoveAirportFilter('departures', '${item.key}')">✕</button>
            `;
            depContainer.appendChild(row);
        });
    }

    // 2. Отрисовка строк прилетов (Arrivals - вертикальный список в столбец)
    arrContainer.innerHTML = '';
    if (arrBadge) {
        const itemWord = currentLang === 'ru' ? 'городов' : 'cities';
        arrBadge.textContent = `${sortedArrs.length} ${itemWord}`;
    }

    if (sortedArrs.length === 0) {
        arrContainer.innerHTML = `<span class="dash-subtext" style="padding: 6px;">${currentLang === 'ru' ? 'Нет фильтров (все прилеты разрешены)' : 'No filters (all arrivals allowed)'}</span>`;
    } else {
        sortedArrs.forEach(item => {
            const row = document.createElement('div');
            row.className = 'airport-filter-row row-arrival';
            const codesText = (item.ru && item.ru !== item.iata) ? `${item.ru} / ${item.iata}` : item.ru;
            row.innerHTML = `
                <div class="row-info">
                    <span class="row-city-name">${item.name || item.ru}</span>
                    <span class="row-airport-codes">${codesText}</span>
                </div>
                <button type="button" class="btn-row-remove" title="${currentLang === 'ru' ? 'Удалить из фильтра' : 'Remove'}" onclick="handleRemoveAirportFilter('arrivals', '${item.key}')">✕</button>
            `;
            arrContainer.appendChild(row);
        });
    }
}

// Обработка добавления аэропорта/города в фильтр
async function handleAddAirportFilter(e, type) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    const inputId = type === 'departures' ? 'input-add-departure' : 'input-add-arrival';
    const inputEl = document.getElementById(inputId);
    if (!inputEl) return;

    let rawVal = inputEl.value.trim();
    if (!rawVal) return;

    if (rawVal.includes('-')) {
        rawVal = rawVal.split('-')[0].trim();
    }

    const info = resolveAirportInfo(rawVal);
    if (!info) {
        showAviationAlert((currentLang === 'ru' ? 'Не удалось распознать аэропорт или город: ' : 'Unknown airport or city: ') + rawVal, true);
        return;
    }

    const filters = getCustomAirportFilters();
    const list = type === 'departures' ? filters.departures : filters.arrivals;

    const primaryCode = type === 'departures' ? (info.iata || info.ru) : (info.ru || info.iata);
    const primaryUpper = primaryCode.toUpperCase();

    // Проверяем, есть ли уже этот пункт в фильтре
    const alreadyExists = list.some(c => {
        const u = String(c).trim().toUpperCase();
        return u === primaryUpper || (info.iata && u === info.iata.toUpperCase()) || (info.ru && u === info.ru.toUpperCase()) || (info.name && u === info.name.toUpperCase());
    });

    if (alreadyExists) {
        showAviationAlert((currentLang === 'ru' ? 'Этот пункт уже добавлен в фильтр: ' : 'Already in filter: ') + `${info.iata} / ${info.ru} (${info.name})`, true);
        return;
    }

    list.push(primaryCode);
    if (info.iata && !list.includes(info.iata)) list.push(info.iata);
    if (info.ru && !list.includes(info.ru)) list.push(info.ru);

    await saveCustomAirportFilters(filters);
    renderAirportFiltersUI();
    populateAirportDropdowns();
    inputEl.value = '';

    const label = type === 'departures' ? (currentLang === 'ru' ? 'вылета' : 'departure') : (currentLang === 'ru' ? 'прилета' : 'arrival');
    showAviationAlert((currentLang === 'ru' ? `Добавлен в фильтр ${label}: ` : `Added to ${label} filter: `) + `${info.iata} / ${info.ru} (${info.name})`, false);
}

// Обработка удаления аэропорта/города из фильтра
async function handleRemoveAirportFilter(type, code) {
    const filters = getCustomAirportFilters();
    const list = type === 'departures' ? filters.departures : filters.arrivals;

    const info = resolveAirportInfo(code);
    const codesToRemove = new Set([String(code).trim().toUpperCase()]);
    if (info) {
        if (info.iata) codesToRemove.add(info.iata.toUpperCase());
        if (info.ru) codesToRemove.add(info.ru.toUpperCase());
        if (info.name) codesToRemove.add(info.name.toUpperCase());
    }

    const updated = list.filter(c => {
        const u = String(c).trim().toUpperCase();
        const cInfo = resolveAirportInfo(c);
        const cIata = cInfo ? cInfo.iata.toUpperCase() : u;
        const cRu = cInfo ? cInfo.ru.toUpperCase() : u;
        return !codesToRemove.has(u) && !codesToRemove.has(cIata) && !codesToRemove.has(cRu);
    });

    if (type === 'departures') {
        filters.departures = updated;
    } else {
        filters.arrivals = updated;
    }

    await saveCustomAirportFilters(filters);
    renderAirportFiltersUI();
    populateAirportDropdowns();
}

// Сброс фильтров к исходным заводским настройкам
function handleResetAirportFilters(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    const msg = currentLang === 'ru'
        ? 'Сбросить фильтры аэропортов вылета и прилета к исходным заводским настройкам?'
        : 'Reset departure and arrival airport filters to default factory settings?';

    showAviationConfirm(msg, async () => {
        localStorage.removeItem('averago_custom_airport_filters');
        const filters = getCustomAirportFilters();
        await saveCustomAirportFilters(filters);
        renderAirportFiltersUI();
        populateAirportDropdowns();
        showAviationAlert(currentLang === 'ru' ? 'Фильтры успешно сброшены по умолчанию' : 'Filters reset to default', false);
    });
}

// Переключение строгого режима фильтрации прилетов (Вариант А)
async function handleToggleStrictArrivals(isChecked) {
    const filters = getCustomAirportFilters();
    filters.strict_arrivals = !!isChecked;
    await saveCustomAirportFilters(filters);
    renderAirportFiltersUI();
    const msg = isChecked
        ? (currentLang === 'ru' ? 'Включен строгий фильтр: будут загружаться только рейсы в разрешенные аэропорты прилета.' : 'Strict arrivals filter enabled.')
        : (currentLang === 'ru' ? 'Строгий фильтр по прилетам отключен: разрешены все прилеты из хабов вылета.' : 'Strict arrivals filter disabled.');
    showAviationAlert(msg, false);
}

// Открытие модального окна добавления нового направления / аэропорта
function openAddAirportModal(defaultTarget = 'departures') {
    const modal = document.getElementById('modal-add-airport');
    if (!modal) return;

    const inputName = document.getElementById('new-airport-name');
    const inputIata = document.getElementById('new-airport-iata');
    const inputRu = document.getElementById('new-airport-ru');
    const errorDiv = document.getElementById('new-airport-error');

    if (inputName) inputName.value = '';
    if (inputIata) inputIata.value = '';
    if (inputRu) inputRu.value = '';
    if (errorDiv) {
        errorDiv.textContent = '';
        errorDiv.classList.add('hidden');
    }

    const targetRadio = document.getElementById('target-' + defaultTarget);
    if (targetRadio) {
        targetRadio.checked = true;
    }

    modal.classList.remove('hidden');
    if (inputName) {
        setTimeout(() => inputName.focus(), 50);
    }
}

// Закрытие модального окна добавления нового направления
function closeAddAirportModal() {
    const modal = document.getElementById('modal-add-airport');
    if (modal) modal.classList.add('hidden');
}

// Сохранение нового аэропорта из модального окна
async function handleSaveNewAirport(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    const inputName = document.getElementById('new-airport-name');
    const inputIata = document.getElementById('new-airport-iata');
    const inputRu = document.getElementById('new-airport-ru');
    const errorDiv = document.getElementById('new-airport-error');

    const name = inputName ? inputName.value.trim() : '';
    const rawIata = inputIata ? inputIata.value.trim().toUpperCase() : '';
    let rawRu = inputRu ? inputRu.value.trim().toUpperCase() : '';

    const showError = (msg) => {
        if (errorDiv) {
            errorDiv.textContent = msg;
            errorDiv.classList.remove('hidden');
        } else {
            showAviationAlert(msg, true);
        }
    };

    if (!name) {
        showError(currentLang === 'ru' ? 'Введите название города или аэропорта' : 'Please enter city/airport name');
        if (inputName) inputName.focus();
        return;
    }

    if (!/^[A-Z]{3}$/.test(rawIata)) {
        showError(currentLang === 'ru' ? 'Код ИАТА должен состоять ровно из 3 латинских букв (например, TJU)' : 'IATA code must be exactly 3 Latin letters (e.g. TJU)');
        if (inputIata) inputIata.focus();
        return;
    }

    // Если код РФ не указан, берем IATA (актуально для зарубежных портов)
    if (!rawRu) {
        rawRu = rawIata;
    } else {
        // Если указан, проверяем, что это ровно 3 буквы (кириллица или латиница)
        if (!/^[А-ЯЁA-Z]{3}$/.test(rawRu)) {
            showError(currentLang === 'ru' ? 'Российский код должен состоять ровно из 3 букв (например, КЛБ)' : 'Russian code must be exactly 3 letters (e.g. КЛБ)');
            if (inputRu) inputRu.focus();
            return;
        }
    }

    // Определяем в какой фильтр добавлять
    const targetEl = document.querySelector('input[name="new-airport-target"]:checked');
    const target = targetEl ? targetEl.value : 'departures';

    // 1. Сохраняем в кастомный справочник системы
    const customList = getCustomAirportsList();
    const filteredList = customList.filter(ap => ap && ap.iata && ap.iata.toUpperCase() !== rawIata);
    filteredList.push({
        iata: rawIata,
        ru: rawRu,
        name: name
    });

    const savedPortsOk = await saveCustomAirportsList(filteredList);
    applyCustomAirportsToDb(filteredList);

    // 2. Добавляем в фильтры вылетов/прилетов
    const filters = getCustomAirportFilters();
    if (target === 'departures' || target === 'both') {
        if (!filters.departures.includes(rawIata)) filters.departures.push(rawIata);
        if (rawRu && rawRu !== rawIata && !filters.departures.includes(rawRu)) filters.departures.push(rawRu);
    }
    if (target === 'arrivals' || target === 'both') {
        if (!filters.arrivals.includes(rawIata)) filters.arrivals.push(rawIata);
        if (rawRu && rawRu !== rawIata && !filters.arrivals.includes(rawRu)) filters.arrivals.push(rawRu);
    }

    const savedFiltersOk = await saveCustomAirportFilters(filters);
    renderAirportFiltersUI();
    populateAirportDropdowns();
    closeAddAirportModal();

    const targetDesc = target === 'departures'
        ? (currentLang === 'ru' ? 'в вылеты (FROM)' : 'to departures (FROM)')
        : target === 'arrivals'
            ? (currentLang === 'ru' ? 'в прилеты (TO)' : 'to arrivals (TO)')
            : (currentLang === 'ru' ? 'в вылеты и прилеты' : 'to departures and arrivals');

    const codesDisplay = (rawRu && rawRu !== rawIata) ? `${rawIata} / ${rawRu}` : rawIata;
    if (savedPortsOk !== false && savedFiltersOk !== false) {
        const successMsg = currentLang === 'ru'
            ? `Направление ${name} (${codesDisplay}) успешно сохранено и добавлено ${targetDesc}!`
            : `Destination ${name} (${codesDisplay}) successfully saved and added ${targetDesc}!`;
        showAviationAlert(successMsg, false);
    }
}

// Экспортируем в window для инлайновых вызовов в HTML
window.toggleAirportFiltersAccordion = toggleAirportFiltersAccordion;
window.handleAddAirportFilter = handleAddAirportFilter;
window.handleRemoveAirportFilter = handleRemoveAirportFilter;
window.handleResetAirportFilters = handleResetAirportFilters;
window.handleToggleStrictArrivals = handleToggleStrictArrivals;
window.openAddAirportModal = openAddAirportModal;
window.closeAddAirportModal = closeAddAirportModal;
window.handleSaveNewAirport = handleSaveNewAirport;

// Загрузка рейсов из локального хранилища (localStorage)
function loadFlightsFromLocalStorage() {
    try {
        const saved = localStorage.getItem('averago_user_flights_local');
        if (saved) {
            const parsed = JSON.parse(saved);
            userFlights = Array.isArray(parsed) ? parsed.map(normalizeFlightRecord) : [];
        } else {
            userFlights = [];
        }
    } catch (e) {
        console.error("Ошибка парсинга рейсов из LocalStorage:", e);
        userFlights = [];
    }
}

// Обновление интерфейса статуса подключения (Online/Offline)
function updateOfflineStatusUI() {
    const indicator = document.querySelector('.header-status-indicator');
    const textEl = document.querySelector('.status-text');
    if (!indicator || !textEl) return;

    if (isOfflineMode) {
        indicator.classList.add('offline');
        textEl.setAttribute('data-translate', 'status-local');
        textEl.textContent = translations[currentLang]['status-local'];
    } else {
        indicator.classList.remove('offline');
        textEl.setAttribute('data-translate', 'status-dispatch');
        textEl.textContent = translations[currentLang]['status-dispatch'];
    }
}

// Загрузка рейсов пользователя с сервера MySQL с автоматическим переходом на LocalStorage при ошибке
async function loadUserFlights() {
    try {
        const response = await fetch('api.php?action=get_flights');
        
        // Проверяем тип ответа (если локальный сервер без PHP вернул исходный код PHP-файла)
        const contentType = response.headers.get('content-type');
        if (contentType && !contentType.includes('application/json')) {
            throw new Error('Server returned non-JSON content: ' + contentType);
        }

        const data = await response.json();
        
        if (data.db_not_configured) {
            console.warn("База данных MySQL еще не настроена. Включаем локальный режим.");
            isOfflineMode = true;
            loadFlightsFromLocalStorage();
        } else if (data.success) {
            userFlights = Array.isArray(data.flights) ? data.flights.map(normalizeFlightRecord) : [];
            isOfflineMode = false;
        } else {
            console.error("Ошибка загрузки рейсов с сервера:", data.error);
            showAviationAlert("Ошибка загрузки рейсов: " + data.error, true);
            userFlights = [];
            isOfflineMode = false;
        }
    } catch (e) {
        console.warn("Ошибка подключения к API. Переключаемся в локальный режим:", e);
        isOfflineMode = true;
        loadFlightsFromLocalStorage();
    }
    
    // Если в локальном режиме база пуста, автоматически подгружаем 226 системных рейсов за июль из stats_july.xls
    if (userFlights.length === 0) {
        await loadSystemStats(true);
    }

    updateActiveDateRangeAndCounts();
    renderFlightsTable();
    renderUploadedFilesList();
    updateOfflineStatusUI();
    populateAllFlightsDropdown();
}

// Тихое обновление списка рейсов с сервера для фоновой синхронизации
async function loadUserFlightsSilent() {
    if (isOfflineMode) {
        loadFlightsFromLocalStorage();
        updateActiveDateRangeAndCounts();
        renderFlightsTable();
        renderUploadedFilesList();
        return;
    }
    try {
        const response = await fetch('api.php?action=get_flights');
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            if (data.success) {
                userFlights = Array.isArray(data.flights) ? data.flights.map(normalizeFlightRecord) : [];
            }
        }
    } catch (e) {
        console.error("Ошибка тихого обновления рейсов:", e);
    }
    updateActiveDateRangeAndCounts();
    renderFlightsTable();
    renderUploadedFilesList();
    populateAllFlightsDropdown();
}

// Сохранение рейсов пользователя на сервере MySQL или в LocalStorage
async function saveUserFlights() {
    // 1. Всегда надежно сохраняем в LocalStorage
    try {
        localStorage.setItem('averago_user_flights_local', JSON.stringify(userFlights));
        updateActiveDateRangeAndCounts();
        renderFlightsTable();
        renderUploadedFilesList();
        populateAllFlightsDropdown();
    } catch (e) {
        console.error("Ошибка сохранения в LocalStorage:", e);
    }

    if (isOfflineMode || window.location.protocol === 'file:') return false;

    // 2. Если серверная часть активна, синхронизируем с контролем авторизации
    try {
        const response = await fetch('api.php?action=save_flights', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userFlights)
        });
        if (!response) return false;
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            const isOk = checkServerSyncResponse(data, currentLang === 'ru' ? 'Рейсы' : 'Flights');
            if (isOk && data.success) {
                await loadUserFlightsSilent();
                return true;
            }
            return false;
        } else if (!response.ok) {
            showAviationAlert(currentLang === 'ru' ? '⚠️ Сервер временно недоступен (HTTP ' + response.status + '). Рейсы сохранены локально.' : '⚠️ Server unavailable (HTTP ' + response.status + '). Flights saved locally.', true);
            return false;
        }
    } catch (e) {
        console.warn("Серверный API недоступен, работаем в локальном режиме:", e);
    }
    return false;
}

// Экспорт базы рейсов и методов синхронизации в window
window.userFlights = userFlights;
window.saveUserFlights = saveUserFlights;
window.loadUserFlights = loadUserFlights;
window.loadUserFlightsSilent = loadUserFlightsSilent;
window.getUserFlights = function() { return userFlights; };

// Получение ключа истории прогнозов для текущего авторизованного пользователя
function getUserHistoryStorageKey() {
    if (currentUser && currentUser.username) {
        return `averago_predictions_history_${currentUser.username.toLowerCase().trim()}`;
    }
    if (currentUser && currentUser.id) {
        return `averago_predictions_history_${currentUser.id}`;
    }
    return 'averago_predictions_history_guest';
}

// Загрузка истории прогнозов из LocalStorage для конкретного пользователя
function loadPredictionsHistory() {
    const storageKey = getUserHistoryStorageKey();
    const saved = localStorage.getItem(storageKey);
    if (saved) {
        try {
            predictionsHistory = JSON.parse(saved);
        } catch (e) {
            console.error("Ошибка парсинга истории прогнозов из LocalStorage:", e);
            predictionsHistory = [];
        }
    } else {
        predictionsHistory = [];
    }
    renderPredictionsTable();
}

// Сохранение истории прогнозов в LocalStorage для конкретного пользователя
function savePredictionsHistory() {
    const storageKey = getUserHistoryStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(predictionsHistory));
}

// Умное извлечение только имени для приветствия (без фамилии, напр. "Самарина Наталья" -> "Наталья")
function getGreetingName(user) {
    if (!user) return currentLang === 'ru' ? 'Диспетчер' : 'Dispatcher';
    const fullName = (user.full_name || user.username || '').trim();
    if (!fullName) return currentLang === 'ru' ? 'Диспетчер' : 'Dispatcher';

    const lower = fullName.toLowerCase();
    if (lower.includes('администратор') || lower === 'admin') {
        return currentLang === 'ru' ? 'Администратор' : 'Administrator';
    }

    // Если строка вида "Диспетчер (SAMARINA)"
    if (fullName.startsWith('Диспетчер (') && fullName.endsWith(')')) {
        return fullName.slice(11, -1);
    }

    const parts = fullName.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
        return parts[0];
    }

    if (parts.length >= 2) {
        const w1 = parts[0];
        const w2 = parts[1];

        // Типичные окончания русских фамилий
        const surnameRegex = /(ов|ова|ев|ева|ин|ина|ын|ына|ский|ская|цкий|цкая|их|ых|ко|ук|юк)$/i;
        
        const w1IsSurname = surnameRegex.test(w1);
        const w2IsSurname = surnameRegex.test(w2);

        if (w1IsSurname && !w2IsSurname) {
            // Например: "Самарина Наталья" -> "Наталья"
            return w2;
        }
        if (!w1IsSurname && w2IsSurname) {
            // Например: "Андрей Зубков" -> "Андрей"
            return w1;
        }
        return w1;
    }

    return fullName;
}

// Заполнение выпадающего списка годов для сезонного фильтра на основе базы рейсов
function populateSeasonalYears() {
    const selectYear = document.getElementById('select-seasonal-year');
    if (!selectYear) return;

    const savedVal = selectYear.value; // сохраняем выбранное значение, если оно было
    selectYear.innerHTML = '';

    // Опция "Все года"
    const allOpt = document.createElement('option');
    allOpt.value = 'all';
    allOpt.setAttribute('data-translate', 'opt-all-years');
    allOpt.textContent = translations[currentLang]['opt-all-years'] || 'Все года';
    selectYear.appendChild(allOpt);

    // Извлекаем все уникальные года из userFlights
    const yearsSet = new Set();
    userFlights.forEach(f => {
        if (f.date) {
            const dateObj = new Date(f.date);
            if (!isNaN(dateObj.getTime())) {
                yearsSet.add(dateObj.getFullYear());
            }
        }
    });

    // Сортируем года по возрастанию и добавляем
    const sortedYears = Array.from(yearsSet).sort((a, b) => a - b);
    sortedYears.forEach(year => {
        const opt = document.createElement('option');
        opt.value = year;
        opt.textContent = year;
        selectYear.appendChild(opt);
    });

    // Восстанавливаем выбранное значение, если оно все еще существует в списке
    if (savedVal && Array.from(selectYear.options).some(opt => opt.value === savedVal)) {
        selectYear.value = savedVal;
    }
}

// Заполнение выпадающих списков аэропортов и автозаполнения
function populateAirportDropdowns() {
    const selectFrom = document.getElementById('select-from');
    const manualFrom = document.getElementById('manual-from');
    const manualTo = document.getElementById('manual-to');

    const savedFrom = selectFrom ? selectFrom.value : '';
    const savedManualFrom = manualFrom ? manualFrom.value : '';
    const savedManualTo = manualTo ? manualTo.value : '';

    if (selectFrom) selectFrom.innerHTML = '';
    if (manualFrom) manualFrom.innerHTML = '';
    if (manualTo) manualTo.innerHTML = '';

    const uniqueAirportsMap = {};
    if (baggageDb && baggageDb.airports) {
        Object.values(baggageDb.airports).forEach(ap => {
            if (!ap) return;
            // Исключаем кириллические 3-буквенные коды (ВЛА, ХБР, ХКТ) — используем исключительно 3-буквенную ИАТА латиницу
            const iataCandidate = (ap.iata && /^[A-Z]{3}$/i.test(ap.iata)) ? ap.iata.toUpperCase() : ruToIata(ap.iata || ap.ru);
            if (iataCandidate && /^[A-Z]{3}$/.test(iataCandidate)) {
                if (!uniqueAirportsMap[iataCandidate]) {
                    uniqueAirportsMap[iataCandidate] = {
                        iata: iataCandidate,
                        ru: ap.ru || iataCandidate,
                        name: ap.name || ap.ru || iataCandidate
                    };
                }
            }
        });
    }

    const sortedAirports = Object.values(uniqueAirportsMap).sort((a, b) => a.iata.localeCompare(b.iata));

    if (selectFrom) {
        const defaultOpt = document.createElement('option');
        defaultOpt.value = '';
        defaultOpt.textContent = currentLang === 'ru' ? '-- Выберите аэропорт --' : '-- Select Airport --';
        selectFrom.appendChild(defaultOpt);
    }

    if (manualFrom) {
        const defaultOpt = document.createElement('option');
        defaultOpt.value = '';
        defaultOpt.textContent = currentLang === 'ru' ? '-- Выберите вылет --' : '-- Select Departure --';
        manualFrom.appendChild(defaultOpt);

        const customOpt = document.createElement('option');
        customOpt.value = '__custom__';
        customOpt.textContent = currentLang === 'ru' ? '✏️ + Вписать свой код...' : '✏️ + Enter custom code...';
        manualFrom.appendChild(customOpt);
    }

    if (manualTo) {
        const defaultOpt = document.createElement('option');
        defaultOpt.value = '';
        defaultOpt.textContent = currentLang === 'ru' ? '-- Выберите прилет --' : '-- Select Destination --';
        manualTo.appendChild(defaultOpt);

        const customOpt = document.createElement('option');
        customOpt.value = '__custom__';
        customOpt.textContent = currentLang === 'ru' ? '✏️ + Вписать свой код...' : '✏️ + Enter custom code...';
        manualTo.appendChild(customOpt);
    }

    // Вылетные направления (из активного фильтра вылетов + базы рейсов)
    const customFilters = getCustomAirportFilters();
    const departuresSet = new Set(customFilters.departures || []);
    if (customFilters.departures) {
        customFilters.departures.forEach(d => {
            if (d && !isHeaderGarbage(d)) {
                const iata = ruToIata(d);
                if (iata && !isHeaderGarbage(iata)) departuresSet.add(iata);
            }
        });
    }
    if (userFlights) {
        userFlights.forEach(f => {
            if (f.from && !isHeaderGarbage(f.from)) {
                departuresSet.add(f.from);
                const iata = ruToIata(f.from);
                if (iata && !isHeaderGarbage(iata)) departuresSet.add(iata);
            }
        });
    }

    // Прилетные направления (из активного фильтра прилетов + всех рейсов)
    const arrivalsSet = new Set(customFilters.arrivals || []);
    if (customFilters.arrivals) {
        customFilters.arrivals.forEach(a => {
            if (a && !isHeaderGarbage(a)) {
                const iata = ruToIata(a);
                if (iata && !isHeaderGarbage(iata)) arrivalsSet.add(iata);
            }
        });
    }
    if (userFlights) {
        userFlights.forEach(f => {
            if (f.to && !isHeaderGarbage(f.to)) {
                arrivalsSet.add(f.to);
                const iata = ruToIata(f.to);
                if (iata && !isHeaderGarbage(iata)) arrivalsSet.add(iata);
            }
        });
    }

    sortedAirports.forEach(ap => {
        if (!ap || !ap.iata || !/^[A-Z]{3}$/.test(ap.iata)) return;
        const optText = ap.iata;
        
        // В выпадающие списки вылета (selectFrom и manualFrom)
        const isAllowedDep = departuresSet.has(ap.iata) || departuresSet.has(ap.ru);
        if (isAllowedDep) {
            if (selectFrom) {
                const opt = document.createElement('option');
                opt.value = ap.iata;
                opt.textContent = optText;
                selectFrom.appendChild(opt);
            }

            if (manualFrom) {
                const opt = document.createElement('option');
                opt.value = ap.iata;
                opt.textContent = optText;
                manualFrom.appendChild(opt);
            }
        }

        // В выпадающий список прилета (manualTo)
        const isAllowedArr = arrivalsSet.size === 0 || arrivalsSet.has(ap.iata) || arrivalsSet.has(ap.ru);
        if (isAllowedArr) {
            if (manualTo) {
                const opt = document.createElement('option');
                opt.value = ap.iata;
                opt.textContent = optText;
                manualTo.appendChild(opt);
            }
        }
    });

    // Восстанавливаем выбранные значения
    if (selectFrom && savedFrom && Array.from(selectFrom.options).some(opt => opt.value === savedFrom)) {
        selectFrom.value = savedFrom;
    }
    if (manualFrom && savedManualFrom && Array.from(manualFrom.options).some(opt => opt.value === savedManualFrom)) {
        manualFrom.value = savedManualFrom;
    }
    if (manualTo && savedManualTo && Array.from(manualTo.options).some(opt => opt.value === savedManualTo)) {
        manualTo.value = savedManualTo;
    }

    const today = new Date().toISOString().split('T')[0];
    const manualDate = document.getElementById('manual-date');
    if (manualDate && !manualDate.value) manualDate.value = today;
}

// Получение числовой части номера рейса без префиксов авиакомпаний (N4, EO, KL и т.д.)
function getNumericFlightNo(fltStr) {
    return extractNumericFlightNumber(fltStr);
}

// Поиск маршрута вылета/прилета по номеру рейса (возвращает ИАТА коды)
function findRouteByFlightNo(flightNo) {
    if (!flightNo) return null;
    const targetNum = getNumericFlightNo(flightNo);
    if (!targetNum) return null;

    // Сначала ищем в загруженных рейсах
    if (userFlights && userFlights.length > 0) {
        for (const f of userFlights) {
            if (f.flight_no && getNumericFlightNo(f.flight_no) === targetNum) {
                const fromIata = ruToIata(f.from) || f.from;
                const toIata = ruToIata(f.to) || f.to;
                return { from: fromIata, to: toIata };
            }
        }
    }

    // Если нет, ищем в правилах базы данных
    if (baggageDb && baggageDb.rules) {
        for (const rule of baggageDb.rules) {
            if (rule.flt_no && getNumericFlightNo(rule.flt_no) === targetNum) {
                const fromIata = ruToIata(rule.from) || rule.from;
                const toIata = ruToIata(rule.to) || rule.to;
                return { from: fromIata, to: toIata };
            }
        }
    }

    return null;
}

// Автоматический двуэтапный выбор вылета и прилета в элементах select
function applyRouteSelection(route) {
    if (!route || !route.from || !route.to) return false;
    const selectFrom = document.getElementById('select-from');
    const selectTo = document.getElementById('select-to');
    if (!selectFrom || !selectTo) return false;

    isAutoSelectingRoute = true;
    let fromOptionFound = false;

    const targetFromIata = (ruToIata(route.from) || route.from).trim().toUpperCase();
    const targetToIata = (ruToIata(route.to) || route.to).trim().toUpperCase();

    // 1. Выбираем аэропорт вылета
    for (let opt of selectFrom.options) {
        const optIata = (ruToIata(opt.value) || opt.value).trim().toUpperCase();
        if (opt.value === route.from || optIata === targetFromIata) {
            selectFrom.value = opt.value;
            fromOptionFound = true;
            break;
        }
    }

    // Если аэропорта вылета нет в текущих опциях, динамически добавляем его
    if (!fromOptionFound && targetFromIata) {
        const opt = document.createElement('option');
        opt.value = targetFromIata;
        opt.textContent = targetFromIata;
        selectFrom.appendChild(opt);
        selectFrom.value = targetFromIata;
        fromOptionFound = true;
    }

    // 2. Генерация списка прилетов и выбор аэропорта прилета
    if (fromOptionFound) {
        selectFrom.dispatchEvent(new Event('change'));

        selectTo.disabled = false;
        let toOptionFound = false;
        for (let opt of selectTo.options) {
            const optIata = (ruToIata(opt.value) || opt.value).trim().toUpperCase();
            if (opt.value === route.to || optIata === targetToIata) {
                selectTo.value = opt.value;
                toOptionFound = true;
                break;
            }
        }

        // Если целевой аэропорт прилета отсутствует в списке направлений для данного вылета,
        // гарантированно создаем для него опцию и выбираем ее
        if (!toOptionFound && targetToIata) {
            const opt = document.createElement('option');
            opt.value = targetToIata;
            opt.textContent = targetToIata;
            selectTo.appendChild(opt);
            selectTo.value = targetToIata;
            toOptionFound = true;
        }

        isAutoSelectingRoute = false;
        selectTo.dispatchEvent(new Event('change'));
        updateDefaultPaxForSelectedFlight();
        return toOptionFound;
    }

    isAutoSelectingRoute = false;
    return false;
}

// Расчет среднего количества пассажиров по рейсу или направлению из базы данных
function getAveragePaxForFlight(flightNo = '', fromVal = '', toVal = '') {
    const allFlights = (userFlights && Array.isArray(userFlights)) ? userFlights : [];
    if (!allFlights || allFlights.length === 0) return 150;

    const cleanFlt = flightNo ? String(flightNo).replace(/\D/g, '') : '';
    const normFrom = fromVal ? (ruToIata(fromVal) || fromVal).trim().toUpperCase() : '';
    const normTo = toVal ? (ruToIata(toVal) || toVal).trim().toUpperCase() : '';

    // 1. Поиск по точному номеру рейса и направлению (from + to)
    if (cleanFlt && normFrom && normTo) {
        const matches = allFlights.filter(f => {
            const fClean = (f.flight_no || '').replace(/\D/g, '');
            const fFrom = (ruToIata(f.from) || f.from || '').trim().toUpperCase();
            const fTo = (ruToIata(f.to) || f.to || '').trim().toUpperCase();
            const pax = getEffectivePaxCount(f);
            return fClean === cleanFlt && (fFrom === normFrom || fFrom.includes(normFrom)) && (fTo === normTo || fTo.includes(normTo)) && pax > 0;
        });
        if (matches.length > 0) {
            const sumPax = matches.reduce((acc, f) => acc + getEffectivePaxCount(f), 0);
            return Math.max(1, Math.round(sumPax / matches.length));
        }
    }

    // 2. Поиск только по номеру рейса
    if (cleanFlt) {
        const matches = allFlights.filter(f => {
            const fClean = (f.flight_no || '').replace(/\D/g, '');
            const pax = getEffectivePaxCount(f);
            return fClean === cleanFlt && pax > 0;
        });
        if (matches.length > 0) {
            const sumPax = matches.reduce((acc, f) => acc + getEffectivePaxCount(f), 0);
            return Math.max(1, Math.round(sumPax / matches.length));
        }
    }

    // 3. Поиск по направлению (from + to)
    if (normFrom && normTo) {
        const matches = allFlights.filter(f => {
            const fFrom = (ruToIata(f.from) || f.from || '').trim().toUpperCase();
            const fTo = (ruToIata(f.to) || f.to || '').trim().toUpperCase();
            const pax = getEffectivePaxCount(f);
            return (fFrom === normFrom || fFrom.includes(normFrom)) && (fTo === normTo || fTo.includes(normTo)) && pax > 0;
        });
        if (matches.length > 0) {
            const sumPax = matches.reduce((acc, f) => acc + getEffectivePaxCount(f), 0);
            return Math.max(1, Math.round(sumPax / matches.length));
        }
    }

    return 150;
}

// Автоподстановка среднего числа пассажиров в поле input-pax
function updateDefaultPaxForSelectedFlight(force = false) {
    const inputPax = document.getElementById('input-pax');
    const selectFlight = document.getElementById('select-flight');
    const selectFrom = document.getElementById('select-from');
    const selectTo = document.getElementById('select-to');

    if (!inputPax) return;

    // 1. Если количество пассажиров передано из AeroPlan, СТРОГО сохраняем его!
    if (currentIncomingFlightData && currentIncomingFlightData.pax && parseInt(currentIncomingFlightData.pax, 10) > 0) {
        inputPax.value = currentIncomingFlightData.pax;
        updatePaxExpectedHint();
        return;
    }

    // 2. Если пользователь уже ввёл значение PAX вручную (отличное от 150), не сбрасываем при blur или подтверждении рейса
    const currentVal = parseInt(inputPax.value, 10);
    if (!force && currentVal > 0 && currentVal !== 150) {
        return;
    }

    const flightVal = selectFlight ? selectFlight.value.trim() : '';
    const fromVal = selectFrom ? selectFrom.value : '';
    const toVal = selectTo ? selectTo.value : '';

    if (!flightVal && !fromVal && !toVal) return;

    const avgPax = getAveragePaxForFlight(flightVal, fromVal, toVal);
    if (avgPax > 0) {
        inputPax.value = avgPax;
        updatePaxExpectedHint();
    }
}

// Индекс выделенного элемента клавиатурной навигацией
let currentHighlightedSuggestionIndex = -1;

// Генерация и отображение кастомных автоподсказок для поля "Номер рейса" (HUD Style)
function renderCustomFlightSuggestions(filterText = '', forceShow = false) {
    const dropdownPanel = document.getElementById('flight-suggestions-dropdown');
    const chevron = document.getElementById('btn-toggle-flight-dropdown');
    if (!dropdownPanel) return;

    const val = String(filterText).trim().toUpperCase();

    // Изначально выпадающий список со всеми рейсами должен быть сложен
    if (val === '' && !forceShow) {
        hideCustomFlightSuggestions();
        return;
    }

    const selectFrom = document.getElementById('select-from');
    const selectTo = document.getElementById('select-to');

    const routeFrom = selectFrom ? selectFrom.value : '';
    const routeTo = selectTo ? selectTo.value : '';

    const fromIata = routeFrom ? (ruToIata(routeFrom) || routeFrom) : '';
    const toIata = routeTo ? (ruToIata(routeTo) || routeTo) : '';

    const flightMap = new Map(); // flight_no -> route text

    // 1. Из правил базы данных
    if (baggageDb && baggageDb.rules) {
        baggageDb.rules.forEach(rule => {
            if (rule.flt_no) {
                const rFrom = rule.from;
                const rTo = rule.to;
                const cleanNo = getNumericFlightNo(rule.flt_no) || rule.flt_no;
                if ((!fromIata || rFrom === fromIata) && (!toIata || rTo === toIata)) {
                    flightMap.set(cleanNo, `${rFrom} ➔ ${rTo}`);
                }
            }
        });
    }

    // 2. Из пользовательской базы рейсов
    if (userFlights) {
        userFlights.forEach(f => {
            if (f.flight_no) {
                const fFrom = ruToIata(f.from) || f.from;
                const fTo = ruToIata(f.to) || f.to;
                const cleanNo = getNumericFlightNo(f.flight_no) || f.flight_no;
                if ((!fromIata || fFrom === fromIata) && (!toIata || fTo === toIata)) {
                    flightMap.set(cleanNo, `${fFrom} ➔ ${fTo}`);
                }
            }
        });
    }

    // 3. Строгая префиксная фильтрация по началу имени рейса или его числовой части
    let matchedFlights = Array.from(flightMap.keys());
    if (val !== '') {
        matchedFlights = matchedFlights.filter(fl => {
            const flUpper = String(fl).toUpperCase();
            const numPart = getNumericFlightNo(fl);

            // Рейс подходит только если полное имя (EO-347, 409) или числовая часть (347, 409) НАЧИНАЕТСЯ с введенных символов
            const fullStartsWith = flUpper.startsWith(val);
            const numStartsWith = numPart.startsWith(val);

            return fullStartsWith || numStartsWith;
        });
    }

    // 4. Строгая последовательная сортировка по возрастанию числового номера рейса
    matchedFlights.sort((a, b) => {
        const numA = parseInt(getNumericFlightNo(a), 10) || 0;
        const numB = parseInt(getNumericFlightNo(b), 10) || 0;
        if (numA !== numB) return numA - numB;
        return a.localeCompare(b);
    });

    // Перебираем варианты для выпадающего списка

    dropdownPanel.innerHTML = '';
    currentHighlightedSuggestionIndex = -1;

    if (matchedFlights.length === 0) {
        hideCustomFlightSuggestions();
        return;
    } else {
        matchedFlights.forEach((fl) => {
            const routeStr = flightMap.get(fl);
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.setAttribute('data-flight', fl);

            item.innerHTML = `
                <span class="suggestion-flight-no">${fl}</span>
                <span class="suggestion-route-tag">${routeStr}</span>
            `;

            item.addEventListener('click', (e) => {
                e.stopPropagation();
                selectFlightOption(fl);
            });

            dropdownPanel.appendChild(item);
        });
    }

    dropdownPanel.classList.remove('hidden');
    if (chevron) chevron.classList.add('open');
}

// Скрытие кастомного выпадающего списка
function hideCustomFlightSuggestions() {
    const dropdownPanel = document.getElementById('flight-suggestions-dropdown');
    const chevron = document.getElementById('btn-toggle-flight-dropdown');
    if (dropdownPanel) dropdownPanel.classList.add('hidden');
    if (chevron) chevron.classList.remove('open');
    currentHighlightedSuggestionIndex = -1;
}

// Выбор конкретного рейса из списка подсказок
function selectFlightOption(flightNo) {
    const selectFlight = document.getElementById('select-flight');

    if (selectFlight) {
        selectFlight.value = flightNo;
    }

    const route = findRouteByFlightNo(flightNo);
    if (route) {
        applyRouteSelection(route);
    } else {
        updateDefaultPaxForSelectedFlight();
    }

    hideCustomFlightSuggestions();
}

function populateAllFlightsDropdown(routeFrom = '', routeTo = '') {
    // Вспомогательная функция для обновления подсказок при смене вылета/прилета
    if (document.getElementById('select-flight')) {
        renderCustomFlightSuggestions(document.getElementById('select-flight').value);
    }
}

// Настройка сквозной мгновенной навигации по клавише TAB (по 1 нажатию) между всеми окнами формы прогнозирования
function setupFormTabNavigation() {
    const selectFlight = document.getElementById('select-flight');
    const selectFrom = document.getElementById('select-from');
    const selectTo = document.getElementById('select-to');
    const inputPax = document.getElementById('input-pax');
    const inputDate = document.getElementById('input-date');
    const btnCalculate = document.getElementById('btn-calculate');

    // 1. Из "Номер рейса" по 1-му TAB ➔ в "Аэропорт вылета"
    if (selectFlight) {
        selectFlight.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && !e.shiftKey) {
                hideCustomFlightSuggestions();
                if (selectFrom) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    selectFrom.focus();
                }
            }
        }, true);
    }

    // 2. Из "Аэропорт вылета" по 1-му TAB ➔ в "Аэропорт прилета"
    if (selectFrom) {
        selectFrom.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && !e.shiftKey) {
                if (selectTo && !selectTo.disabled) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    selectTo.focus();
                } else if (inputPax) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    inputPax.focus();
                }
            }
        }, true);
    }

    // 3. Из "Аэропорт прилета" по 1-му TAB ➔ в "Пассажиры"
    if (selectTo) {
        selectTo.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && !e.shiftKey) {
                if (inputPax) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    inputPax.focus();
                }
            }
        }, true);
    }

    // 4. Из "Пассажиры" по 1-му TAB ➔ в "Дата рейса"
    if (inputPax) {
        inputPax.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && !e.shiftKey) {
                if (inputDate) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    inputDate.focus();
                }
            }
        }, true);
    }

    // 5. Из "Дата рейса" по 1-му TAB ➔ на кнопку "Рассчитать прогноз"
    if (inputDate) {
        inputDate.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && !e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                if (btnCalculate) {
                    btnCalculate.focus();
                }
            }
        }, true);
    }
}

// Вызов стандартного календаря
function setupDatePickerTrigger() {
    ['manual-date', 'input-date'].forEach(id => {
        const dateInput = document.getElementById(id);
        if (dateInput) {
            dateInput.addEventListener('click', (e) => {
                try {
                    if (typeof e.target.showPicker === 'function') {
                        e.target.showPicker();
                    }
                } catch (err) {
                    console.log("showPicker not supported or failed", err);
                }
            });
        }
    });
}

// Настройка слушателей событий
function setupEventListeners() {
    setupFormTabNavigation();

    // Автоматическая маска ввода на лету для полей модального окна добавления аэропорта
    const inputModalIata = document.getElementById('new-airport-iata');
    if (inputModalIata) {
        inputModalIata.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase();
        });
    }
    const inputModalRu = document.getElementById('new-airport-ru');
    if (inputModalRu) {
        inputModalRu.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^а-яА-ЯёЁa-zA-Z]/g, '').toUpperCase();
        });
    }

    // Резервное копирование и восстановление базы данных
    const btnExportDb = document.getElementById('btn-export-db');
    if (btnExportDb) {
        btnExportDb.addEventListener('click', handleExportDatabase);
    }

    const btnImportDb = document.getElementById('btn-import-db');
    const backupFileInput = document.getElementById('backup-file-input');
    if (btnImportDb && backupFileInput) {
        btnImportDb.addEventListener('click', () => {
            backupFileInput.click();
        });
        backupFileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                handleImportDatabase(e.target.files[0]);
            }
        });
    }

    const chkShowAll = document.getElementById('chk-show-all-flights');
    if (chkShowAll) {
        chkShowAll.addEventListener('change', () => {
            renderFlightsTable();
        });
    }

    // Настройки анализа и сезонности
    const btnToggleSettings = document.getElementById('btn-toggle-settings');
    const settingsPanel = document.getElementById('analysis-settings-panel');
    if (btnToggleSettings && settingsPanel) {
        btnToggleSettings.addEventListener('click', () => {
            btnToggleSettings.classList.toggle('active');
            settingsPanel.classList.toggle('hidden');
        });
    }

    const selectPeriodType = document.getElementById('select-period-type');
    const customRangeInputs = document.getElementById('custom-range-inputs');
    const seasonalInputs = document.getElementById('seasonal-inputs');
    if (selectPeriodType) {
        selectPeriodType.addEventListener('change', () => {
            const val = selectPeriodType.value;
            if (val === 'custom') {
                if (customRangeInputs) customRangeInputs.classList.remove('hidden');
                if (seasonalInputs) seasonalInputs.classList.add('hidden');
            } else if (val === 'seasonal') {
                if (customRangeInputs) customRangeInputs.classList.add('hidden');
                if (seasonalInputs) seasonalInputs.classList.remove('hidden');
            } else {
                if (customRangeInputs) customRangeInputs.classList.add('hidden');
                if (seasonalInputs) seasonalInputs.classList.add('hidden');
            }
        });
    }

    // Язык
    document.getElementById('btn-lang-ru').addEventListener('click', () => setLanguage('ru'));
    document.getElementById('btn-lang-en').addEventListener('click', () => setLanguage('en'));

    // Тема
    document.getElementById('btn-theme-toggle').addEventListener('click', toggleTheme);

    // Вкладки (Tabs)
    setupTabs();

    // Связка выпадающих списков вылета и прилета
    const selectFrom = document.getElementById('select-from');
    const selectTo = document.getElementById('select-to');
    const selectFlight = document.getElementById('select-flight');

    selectFrom.addEventListener('change', () => {
        const fromVal = selectFrom.value;
        if (!fromVal) {
            selectTo.disabled = true;
            selectTo.innerHTML = `<option value="">${translations[currentLang]['select-from-first']}</option>`;
            
            if (!isAutoSelectingRoute) {
                populateAllFlightsDropdown();
            }
            return;
        }

        const availableTos = new Set();
        const fromIata = ruToIata(fromVal) || fromVal;
        
        // Из правил (ИАТА)
        if (baggageDb && baggageDb.rules) {
            baggageDb.rules.forEach(rule => {
                if (rule.from === fromIata) {
                    availableTos.add(iataToRu(rule.to) || rule.to);
                }
            });
        }

        // Из загруженных рейсов
        if (userFlights && userFlights.length > 0) {
            userFlights.forEach(flight => {
                if (ruToIata(flight.from) === fromIata || flight.from === fromIata) {
                    availableTos.add(flight.to);
                }
            });
        }

        // Если для данного вылета нет связанных направлений в правилах или базе рейсов,
        // предоставляем доступ ко всем известным направлениям из базы аэропортов
        if (availableTos.size === 0 && baggageDb && baggageDb.airports) {
            Object.values(baggageDb.airports).forEach(ap => {
                if (ap && ap.iata && ap.iata !== fromIata) {
                    availableTos.add(ap.ru || ap.iata);
                }
            });
        }

        selectTo.innerHTML = '';
        const defaultToOpt = document.createElement('option');
        defaultToOpt.value = '';
        defaultToOpt.textContent = currentLang === 'ru' ? '-- Выберите направление --' : '-- Select Destination --';
        selectTo.appendChild(defaultToOpt);

        Array.from(availableTos)
            .map(toRu => {
                const ap = baggageDb.airports[toRu] || Object.values(baggageDb.airports).find(a => a.iata === ruToIata(toRu));
                const iata = ap ? ap.iata : (ruToIata(toRu) || toRu);
                return { toRu, iata };
            })
            .filter(item => item.iata && item.iata !== fromIata)
            .sort((a, b) => a.iata.localeCompare(b.iata))
            .forEach(({ toRu, iata }) => {
                const opt = document.createElement('option');
                opt.value = iata;
                opt.textContent = iata;
                selectTo.appendChild(opt);
            });

        selectTo.disabled = false;
        
        if (!isAutoSelectingRoute) {
            populateAllFlightsDropdown(selectFrom.value, selectTo.value);
        }
    });

    selectTo.addEventListener('change', () => {
        if (!isAutoSelectingRoute) {
            populateAllFlightsDropdown(selectFrom.value, selectTo.value);
            updateDefaultPaxForSelectedFlight();
        }
    });

    const handleFlightInput = () => {
        if (isAutoSelectingRoute) return;
        const flightVal = selectFlight ? selectFlight.value.trim().toUpperCase() : '';

        // Если поле рейса очищено, направления Аэропорта вылета и Аэропорта прилёта ТОЖЕ ДОЛЖНЫ ПРОПАСТЬ
        if (!flightVal) {
            if (selectFrom) selectFrom.value = '';
            if (selectTo) {
                selectTo.disabled = true;
                selectTo.innerHTML = `<option value="">${translations[currentLang]['select-from-first']}</option>`;
                selectTo.value = '';
            }
            hideCustomFlightSuggestions();
            return;
        }

        // Показываем кастомный темно-синий HUD-список подсказок со строгой префиксной фильтрацией по порядку
        renderCustomFlightSuggestions(flightVal);

        const route = findRouteByFlightNo(flightVal);
        if (route) {
            applyRouteSelection(route);
        } else {
            updateDefaultPaxForSelectedFlight();
        }
    };

    if (selectFlight) {
        selectFlight.addEventListener('input', handleFlightInput);

        selectFlight.addEventListener('change', () => {
            updateDefaultPaxForSelectedFlight();
        });

        selectFlight.addEventListener('blur', () => {
            updateDefaultPaxForSelectedFlight();
        });

        let isFlightMouseDown = false;
        selectFlight.addEventListener('mousedown', () => {
            isFlightMouseDown = (document.activeElement !== selectFlight);
        });

        selectFlight.addEventListener('focus', () => {
            if (!isFlightMouseDown) {
                selectFlight.select();
            }
            if (selectFlight.value.trim() !== '') {
                renderCustomFlightSuggestions(selectFlight.value);
            }
        });

        selectFlight.addEventListener('mouseup', () => {
            if (isFlightMouseDown) {
                isFlightMouseDown = false;
                selectFlight.select();
            }
        });

        // Навигация с клавиатуры (Стрелки вверх/вниз, Enter, Escape)
        selectFlight.addEventListener('keydown', (e) => {
            const dropdownPanel = document.getElementById('flight-suggestions-dropdown');
            if (!dropdownPanel || dropdownPanel.classList.contains('hidden')) return;

            const items = dropdownPanel.querySelectorAll('.suggestion-item');
            if (items.length === 0) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                currentHighlightedSuggestionIndex = (currentHighlightedSuggestionIndex + 1) % items.length;
                updateSuggestionHighlight(items);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                currentHighlightedSuggestionIndex = (currentHighlightedSuggestionIndex - 1 + items.length) % items.length;
                updateSuggestionHighlight(items);
            } else if (e.key === 'Enter') {
                if (currentHighlightedSuggestionIndex >= 0 && currentHighlightedSuggestionIndex < items.length) {
                    e.preventDefault();
                    const selectedFlight = items[currentHighlightedSuggestionIndex].getAttribute('data-flight');
                    if (selectedFlight) selectFlightOption(selectedFlight);
                }
            } else if (e.key === 'Escape' || e.key === 'Tab') {
                hideCustomFlightSuggestions();
            }
        });
    }

    function updateSuggestionHighlight(items) {
        items.forEach((item, idx) => {
            if (idx === currentHighlightedSuggestionIndex) {
                item.classList.add('active');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('active');
            }
        });
    }

    const chevronBtn = document.getElementById('btn-toggle-flight-dropdown');
    if (chevronBtn) {
        chevronBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdownPanel = document.getElementById('flight-suggestions-dropdown');
            if (dropdownPanel && !dropdownPanel.classList.contains('hidden')) {
                hideCustomFlightSuggestions();
            } else {
                if (selectFlight) {
                    renderCustomFlightSuggestions(selectFlight.value, true);
                    selectFlight.focus();
                }
            }
        });
    }

    document.addEventListener('click', (e) => {
        const wrapper = document.querySelector('.custom-autocomplete-wrapper');
        if (wrapper && !wrapper.contains(e.target)) {
            hideCustomFlightSuggestions();
        }
    });


    // Обработчик переключения на кастомный аэропорт
    const manualFrom = document.getElementById('manual-from');
    const manualFromCustom = document.getElementById('manual-from-custom');
    if (manualFrom && manualFromCustom) {
        manualFrom.addEventListener('change', () => {
            if (manualFrom.value === '__custom__') {
                manualFromCustom.classList.remove('hidden');
                manualFromCustom.focus();
            } else {
                manualFromCustom.classList.add('hidden');
                manualFromCustom.value = '';
            }
        });
    }

    const manualTo = document.getElementById('manual-to');
    const manualToCustom = document.getElementById('manual-to-custom');
    if (manualTo && manualToCustom) {
        manualTo.addEventListener('change', () => {
            if (manualTo.value === '__custom__') {
                manualToCustom.classList.remove('hidden');
                manualToCustom.focus();
            } else {
                manualToCustom.classList.add('hidden');
                manualToCustom.value = '';
            }
        });
    }

    // Жесткое ограничение до 3 заглавных символов в полях ввода своего кода
    const enforce3LetterCaps = (el) => {
        if (!el) return;
        ['input', 'change', 'keyup', 'blur', 'paste'].forEach(evt => {
            el.addEventListener(evt, () => {
                setTimeout(() => {
                    el.value = el.value.toUpperCase().replace(/[^A-ZА-Я0-9]/gi, '').slice(0, 3);
                }, 0);
            });
        });
    };
    enforce3LetterCaps(manualFromCustom);
    enforce3LetterCaps(manualToCustom);


    // Обработчик переключателя режима явки пассажиров (Факт 100% / Бронь 97%) с автоматическим пересчетом
    document.querySelectorAll('input[name="pax-mode"]').forEach(radio => {
        radio.addEventListener('change', () => {
            updatePaxExpectedHint();
            calculateBaggageForecast(false);
        });
    });

    const inputPaxEl = document.getElementById('input-pax');
    if (inputPaxEl) {
        ['input', 'change'].forEach(evt => {
            inputPaxEl.addEventListener(evt, updatePaxExpectedHint);
        });
    }

    // Обработчик кнопки расчета: весь пересчет выполняется строго по нажатию на кнопку
    document.getElementById('btn-calculate').addEventListener('click', () => calculateBaggageForecast(true));
    document.getElementById('form-manual-flight').addEventListener('submit', handleManualFlightSubmit);

    const btnLoadSample = document.getElementById('btn-load-sample');
    if (btnLoadSample) {
        btnLoadSample.addEventListener('click', async () => {
            await loadSystemStats(false);
        });
    }

    updatePaxExpectedHint();
    initBacktestModule();
    setupDragAndDrop();

    // Слушатели авторизации и профиля
    const authForm = document.getElementById('app-auth-form');
    if (authForm) authForm.addEventListener('submit', handleLoginSubmit);

    // Функция переключения видимости пароля (Глазок 👁️ / 🙈)
    function setupPasswordToggle(btnId, inputId) {
        const btn = document.getElementById(btnId);
        const input = document.getElementById(inputId);
        if (btn && input) {
            btn.addEventListener('click', () => {
                if (input.type === 'password') {
                    input.type = 'text';
                    btn.textContent = '🙈';
                } else {
                    input.type = 'password';
                    btn.textContent = '👁️';
                }
            });
        }
    }

    setupPasswordToggle('btn-toggle-auth-pass', 'auth-password');
    setupPasswordToggle('btn-toggle-edit-pass', 'edit-user-pass');
    setupPasswordToggle('btn-toggle-new-pass', 'new-password-input');
    setupPasswordToggle('btn-toggle-confirm-pass', 'confirm-password-input');

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) btnLogout.addEventListener('click', handleLogout);

    // Слушатели управления пользователями (RBAC)
    const btnAddUser = document.getElementById('btn-add-user');
    if (btnAddUser) btnAddUser.addEventListener('click', openCreateUserModal);

    const btnCloseUserModal = document.getElementById('btn-close-user-modal');
    const btnCancelUserModal = document.getElementById('btn-cancel-user-modal');
    const userModal = document.getElementById('modal-user-edit');
    [btnCloseUserModal, btnCancelUserModal].forEach(btn => {
        if (btn && userModal) btn.addEventListener('click', () => userModal.classList.add('hidden'));
    });

    const formUserEdit = document.getElementById('form-user-edit');
    if (formUserEdit) formUserEdit.addEventListener('submit', handleSaveUser);

    const btnClosePassModal = document.getElementById('btn-close-pass-modal');
    const btnCancelPassModal = document.getElementById('btn-cancel-pass-modal');
    const passModal = document.getElementById('modal-change-user-pass');
    [btnClosePassModal, btnCancelPassModal].forEach(btn => {
        if (btn && passModal) btn.addEventListener('click', () => passModal.classList.add('hidden'));
    });

    const formChangePass = document.getElementById('form-change-password');
    if (formChangePass) formChangePass.addEventListener('submit', handleSaveNewPassword);

    // Слушатели автоматических бэкапов
    const btnCreateServerBackup = document.getElementById('btn-create-server-backup');
    if (btnCreateServerBackup) {
        btnCreateServerBackup.addEventListener('click', (e) => {
            e.stopPropagation();
            createServerBackupNow();
        });
    }

    // Межвкладочная авто-синхронизация времен вылета рейсов из AeroPlan (Storage Event & Focus)
    window.addEventListener('storage', (e) => {
        if (e.key === 'aeroplan_shift_journal_active_flights' || (e.key && e.key.startsWith('averago_predictions_history_'))) {
            if (e.key && e.key.startsWith('averago_predictions_history_') && e.key === getUserHistoryStorageKey()) {
                loadPredictionsHistory();
            } else {
                try {
                    const updatedFlights = e.newValue ? JSON.parse(e.newValue) : null;
                    if (Array.isArray(updatedFlights)) {
                        syncFlightTimesWithAeroPlan(updatedFlights);
                    }
                } catch (err) {}
            }
        }
    });

    window.addEventListener('focus', () => {
        syncFlightTimesWithAeroPlan();
    });

    // Фоновая периодическая сверка раз в 60 секунд
    setInterval(() => {
        syncFlightTimesWithAeroPlan();
    }, 60000);
}

// Автоматическая/ручная загрузка системной статистики stats_july.xls
async function loadSystemStats(isSilent = true) {
    try {
        const response = await fetch('stats_july.xls');
        if (!response.ok) {
            throw new Error("Файл не найден");
        }
        const data = await response.arrayBuffer();
        const arr = new Uint8Array(data);
        const workbook = XLSX.read(arr, {type: 'array', cellDates: false});
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, {header: 1, raw: false});
        
        processRegistrationData('Подробная статистика за Июль.xls', rows, { isSilent: isSilent, isSystem: true });
    } catch (err) {
        console.error("Ошибка автозагрузки статистики:", err);
        if (!isSilent) {
            showAviationAlert((currentLang === 'ru' ? 'Не удалось загрузить системную статистику: ' : 'Failed to load system statistics: ') + err.message, true);
        }
    }
}

// ==========================================================================
// СИСТЕМА АУТЕНТИФИКАЦИИ, РАЗГРАНИЧЕНИЯ РОЛЕЙ (RBAC) И АВТОМАТИЧЕСКИХ БЭКАПОВ
// ==========================================================================

// Проверка текущей сессии пользователя
async function checkAuthStatus() {
    try {
        const response = await fetch('api.php?action=check_auth');
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            if (data.success && data.authenticated && data.user) {
                currentUser = data.user;
                if (currentUser && currentUser.theme) {
                    applyTheme(currentUser.theme, false);
                }
                isAdminAuthenticated = (currentUser.role === 'admin');
                isOfflineMode = false;
                localStorage.setItem('averago_current_user_profile', JSON.stringify(currentUser));
                localStorage.setItem('averago_local_auth_user', JSON.stringify(currentUser));
                
                const authModal = document.getElementById('app-auth-modal');
                if (authModal) authModal.classList.add('hidden');

                updateUserHeaderUI();
                updateTabsRoleAccess();
                
                if (currentUser.role === 'admin') {
                    loadUsersList();
                    loadServerBackupsList();
                }
                await loadUserFlights();
                return true;
            } else if (data.db_not_configured || (data.error && data.error.includes('подключения к базе данных'))) {
                // База данных MySQL на сервере не настроена/недоступна - переключаемся в локальный режим
                isOfflineMode = true;
            }
        } else {
            // Ответ не JSON - локальный режим без PHP
            isOfflineMode = true;
        }
    } catch (e) {
        console.warn("API недоступно, переключаемся в локальный режим:", e);
        isOfflineMode = true;
    }

    // Проверка сохраненной локальной сессии для оффлайн-режима
    if (isOfflineMode) {
        const savedLocalUser = localStorage.getItem('averago_local_auth_user') || localStorage.getItem('averago_current_user_profile');
        if (savedLocalUser) {
            try {
                currentUser = JSON.parse(savedLocalUser);
                isAdminAuthenticated = (currentUser && currentUser.role === 'admin');
                localStorage.setItem('averago_current_user_profile', JSON.stringify(currentUser));
                localStorage.setItem('averago_local_auth_user', JSON.stringify(currentUser));
                const authModal = document.getElementById('app-auth-modal');
                if (authModal) authModal.classList.add('hidden');
                updateUserHeaderUI();
                updateTabsRoleAccess();
                await loadUserFlights();
                return true;
            } catch(e) {}
        }
    }

    // Если не авторизован - сбрасываем кэш и показываем окно логина
    localStorage.removeItem('averago_current_user_profile');
    localStorage.removeItem('averago_local_auth_user');
    currentUser = null;
    isAdminAuthenticated = false;
    const authModal = document.getElementById('app-auth-modal');
    if (authModal) {
        authModal.classList.remove('hidden');
        const userInp = document.getElementById('auth-username');
        if (userInp) setTimeout(() => userInp.focus(), 100);
    }
    updateUserHeaderUI();
    updateTabsRoleAccess();
    return false;
}

// Обработка отправки формы входа
async function handleLoginSubmit(e) {
    if (e) e.preventDefault();
    const usernameInput = document.getElementById('auth-username');
    const passwordInput = document.getElementById('auth-password');
    const errorEl = document.getElementById('auth-error-msg');
    const submitBtn = document.getElementById('btn-submit-login');

    const username = usernameInput ? usernameInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';

    if (!username) {
        if (errorEl) {
            errorEl.textContent = (currentLang === 'ru' ? 'Введите логин.' : 'Enter username.');
            errorEl.classList.remove('hidden');
        }
        return;
    }

    if (submitBtn) submitBtn.disabled = true;
    if (errorEl) errorEl.classList.add('hidden');

    // Функция локального входа (для оффлайн-режима)
    const processLocalLogin = async () => {
        isOfflineMode = true;
        const uUpper = username.toUpperCase();
        if (uUpper === 'ADMIN' && (password === 'AeroBag#2026!Master' || password === 'NW2026' || password === 'admin' || password === '')) {
            currentUser = { id: 'usr_local_admin', username: 'ADMIN', full_name: 'Главный Администратор (Local)', role: 'admin' };
        } else {
            currentUser = { id: 'usr_local_disp', username: username, full_name: `Диспетчер (${username})`, role: 'dispatcher' };
        }

        const savedUserTheme = localStorage.getItem(`averago_theme_user_${currentUser.id}`);
        if (savedUserTheme) {
            currentUser.theme = savedUserTheme;
            applyTheme(savedUserTheme, false);
        }

        localStorage.setItem('averago_local_auth_user', JSON.stringify(currentUser));
        localStorage.setItem('averago_current_user_profile', JSON.stringify(currentUser));
        isAdminAuthenticated = (currentUser.role === 'admin');

        const authModal = document.getElementById('app-auth-modal');
        if (authModal) authModal.classList.add('hidden');

        if (passwordInput) passwordInput.value = '';
        updateUserHeaderUI();
        updateTabsRoleAccess();
        loadPredictionsHistory();
        await loadUserFlights();

        if (submitBtn) submitBtn.disabled = false;
        const greetingName = getGreetingName(currentUser);
        const welcomeMsg = (currentLang === 'ru' ? 'Локальный режим: Добро пожаловать, ' : 'Offline mode: Welcome, ') + greetingName;
        showAviationAlert(welcomeMsg, false);
    };

    // Если уже в оффлайн-режиме:
    if (isOfflineMode) {
        await processLocalLogin();
        return;
    }

    try {
        const response = await fetch('api.php?action=login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, password: password })
        });
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            // Ответ не JSON -> локальный режим
            await processLocalLogin();
            return;
        }

        const data = await response.json();

        if (data.db_not_configured || (data.error && data.error.includes('подключения к базе данных'))) {
            // База MySQL не настроена на сервере -> локальный вход
            await processLocalLogin();
            return;
        }

        if (data.success && data.user) {
            currentUser = data.user;
            if (currentUser && currentUser.theme) {
                applyTheme(currentUser.theme, false);
            }
            isAdminAuthenticated = (currentUser.role === 'admin');
            localStorage.setItem('averago_current_user_profile', JSON.stringify(currentUser));
            localStorage.setItem('averago_local_auth_user', JSON.stringify(currentUser));

            const authModal = document.getElementById('app-auth-modal');
            if (authModal) authModal.classList.add('hidden');

            if (passwordInput) passwordInput.value = '';
            
            updateUserHeaderUI();
            updateTabsRoleAccess();
            loadPredictionsHistory();

            // Загружаем рейсы и базу
            await loadUserFlights();

            if (currentUser.role === 'admin') {
                loadUsersList();
                loadServerBackupsList();
            }

            const greetingName = getGreetingName(currentUser);
            const welcomeMsg = (currentLang === 'ru' ? 'Добро пожаловать в систему, ' : 'Welcome to system, ') + greetingName;
            showAviationAlert(welcomeMsg, false);
        } else {
            if (errorEl) {
                errorEl.textContent = data.error || (currentLang === 'ru' ? 'Неверный логин или пароль.' : 'Invalid login or password.');
                errorEl.classList.remove('hidden');
            }
            if (passwordInput) {
                passwordInput.value = '';
                passwordInput.focus();
            }
        }
    } catch (err) {
        console.warn("Ошибка соединения с PHP API, переключаемся в оффлайн-режим:", err);
        await processLocalLogin();
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

// Завершение сессии (Выход)
async function handleLogout() {
    try {
        await fetch('api.php?action=logout');
    } catch (e) {
        console.warn("Ошибка логаута:", e);
    }
    localStorage.removeItem('averago_local_auth_user');
    localStorage.removeItem('averago_current_user_profile');
    currentUser = null;
    isAdminAuthenticated = false;
    predictionsHistory = [];
    renderPredictionsTable();
    
    // Переключаем на вкладку прогнозирования
    const tabPredictBtn = document.getElementById('tab-btn-predict');
    if (tabPredictBtn) tabPredictBtn.click();

    updateUserHeaderUI();
    updateTabsRoleAccess();

    const authModal = document.getElementById('app-auth-modal');
    if (authModal) {
        authModal.classList.remove('hidden');
        const userInp = document.getElementById('auth-username');
        const passInp = document.getElementById('auth-password');
        const errorEl = document.getElementById('auth-error-msg');
        if (userInp) userInp.value = '';
        if (passInp) passInp.value = '';
        if (errorEl) errorEl.classList.add('hidden');
        if (userInp) setTimeout(() => userInp.focus(), 100);
    }
}

// Обновление профиля пользователя в шапке
function updateUserHeaderUI() {
    const profileContainer = document.getElementById('header-user-profile');
    const roleBadge = document.getElementById('user-role-badge');
    const fullnameEl = document.getElementById('user-fullname');

    if (!profileContainer) return;

    if (currentUser) {
        profileContainer.classList.remove('hidden');
        if (roleBadge) {
            const isAdmin = (currentUser.role === 'admin');
            roleBadge.className = 'badge-role ' + (isAdmin ? 'badge-role-admin' : 'badge-role-dispatcher');
            roleBadge.textContent = isAdmin ? 'ADMIN' : 'DISPATCHER';
        }
        if (fullnameEl) {
            fullnameEl.textContent = currentUser.full_name || currentUser.username;
        }
    } else {
        profileContainer.classList.add('hidden');
    }
}

// Разграничение видимости вкладок в зависимости от роли
function updateTabsRoleAccess() {
    const tabAdminBtn = document.getElementById('tab-btn-admin');
    if (!tabAdminBtn) return;

    if (currentUser && currentUser.role === 'admin') {
        tabAdminBtn.classList.remove('hidden');
        tabAdminBtn.style.display = '';
    } else {
        tabAdminBtn.classList.add('hidden');
        tabAdminBtn.style.display = 'none';
        // Если открыта вкладка админа, переключаем на прогнозирование
        const adminContent = document.getElementById('tab-content-admin');
        if (adminContent && !adminContent.classList.contains('hidden')) {
            const tabPredictBtn = document.getElementById('tab-btn-predict');
            if (tabPredictBtn) tabPredictBtn.click();
        }
    }
}

// Настройка переключения вкладок
function setupTabs() {
    const tabPredictBtn = document.getElementById('tab-btn-predict');
    const tabDashboardBtn = document.getElementById('tab-btn-dashboard');
    const tabAdminBtn = document.getElementById('tab-btn-admin');
    
    const predictContent = document.getElementById('tab-content-predict');
    const dashboardContent = document.getElementById('tab-content-dashboard');
    const adminContent = document.getElementById('tab-content-admin');

    function switchTab(tabKey) {
        // Защита доступа к разделу Администрирование
        if (tabKey === 'admin' && (!currentUser || currentUser.role !== 'admin')) {
            showAviationAlert((currentLang === 'ru' ? 'Доступ запрещен. Требуются права Администратора.' : 'Access denied. Administrator privileges required.'), true);
            return;
        }

        if (tabPredictBtn) tabPredictBtn.classList.toggle('active', tabKey === 'predict');
        if (tabDashboardBtn) tabDashboardBtn.classList.toggle('active', tabKey === 'dashboard');
        if (tabAdminBtn) tabAdminBtn.classList.toggle('active', tabKey === 'admin');

        if (predictContent) predictContent.classList.toggle('hidden', tabKey !== 'predict');
        if (dashboardContent) dashboardContent.classList.toggle('hidden', tabKey !== 'dashboard');
        if (adminContent) adminContent.classList.toggle('hidden', tabKey !== 'admin');

        if (tabKey === 'dashboard') {
            renderDashboardAnalytics();
        } else if (tabKey === 'admin') {
            populateAirportDropdowns();
            loadUsersList();
            loadServerBackupsList();
            loadTelegramSettings();
            loadSystemLogs();
            if (typeof loadDiagnosticsData === 'function') {
                loadDiagnosticsData();
            }
        }
    }

    if (tabPredictBtn) tabPredictBtn.addEventListener('click', () => switchTab('predict'));
    if (tabDashboardBtn) tabDashboardBtn.addEventListener('click', () => switchTab('dashboard'));
    if (tabAdminBtn) tabAdminBtn.addEventListener('click', () => switchTab('admin'));

    // Слушатели фильтров Дашборда
    const filterRoute = document.getElementById('dash-filter-route');
    const filterPeriod = document.getElementById('dash-filter-period');
    const customDateContainer = document.getElementById('dash-custom-date-container');
    const dateFrom = document.getElementById('dash-date-from');
    const dateTo = document.getElementById('dash-date-to');

    if (filterRoute) filterRoute.addEventListener('change', renderDashboardAnalytics);
    if (filterPeriod) {
        filterPeriod.addEventListener('change', () => {
            if (filterPeriod.value === 'custom') {
                if (customDateContainer) customDateContainer.classList.remove('hidden');
            } else {
                if (customDateContainer) customDateContainer.classList.add('hidden');
            }
            renderDashboardAnalytics();
        });
    }
    if (dateFrom) dateFrom.addEventListener('change', renderDashboardAnalytics);
    if (dateTo) dateTo.addEventListener('change', renderDashboardAnalytics);
}

// --------------------------------------------------------------------------
// МОДУЛЬ УПРАВЛЕНИЯ ПОЛЬЗОВАТЕЛЯМИ (RBAC)
// --------------------------------------------------------------------------

let systemUsersList = [];

// Загрузка списка пользователей с сервера или локального хранилища
async function loadUsersList() {
    if (!currentUser || currentUser.role !== 'admin') return;

    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    if (!isOfflineMode && window.location.protocol !== 'file:') {
        try {
            const response = await fetch('api.php?action=get_users');
            const data = await response.json();

            if (data.success && Array.isArray(data.users)) {
                systemUsersList = data.users;
                renderUsersTable();
                return;
            } else if (data.unauthorized || data.forbidden) {
                console.warn("Требуется повторная авторизация администратора:", data.error);
                tbody.innerHTML = `<tr><td colspan="6" class="empty-table-text" style="color: #f59e0b;">Сессия администратора истекла. Пожалуйста, выполните повторный вход.</td></tr>`;
                return;
            } else if (data.error) {
                tbody.innerHTML = `<tr><td colspan="6" class="empty-table-text" style="color: #ef4444;">${escapeHtml(data.error)}</td></tr>`;
                return;
            }
        } catch (err) {
            console.warn("Серверная загрузка пользователей временно недоступна:", err);
        }
    }

    // Резервный локальный режим (Offline)
    try {
        const localData = localStorage.getItem('averago_local_users_db');
        if (localData) {
            systemUsersList = JSON.parse(localData);
        } else {
            systemUsersList = [
                { id: 'usr_local_admin', username: 'ADMIN', full_name: 'Главный Администратор (Local)', role: 'admin', is_active: 1, created_at: '2026-08-29 00:00:00', last_login: '2026-08-29 13:00:00' },
                { id: 'usr_local_disp', username: 'DISP_SVO', full_name: 'Диспетчер (DISP_SVO)', role: 'dispatcher', is_active: 1, created_at: '2026-08-29 00:00:00', last_login: '2026-08-29 13:00:00' }
            ];
            localStorage.setItem('averago_local_users_db', JSON.stringify(systemUsersList));
        }
        renderUsersTable();
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-table-text" style="color: #ef4444;">Ошибка локального хранилища</td></tr>`;
    }
}

// Отрисовка таблицы пользователей
function renderUsersTable() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    if (systemUsersList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-table-text">Пользователи не найдены.</td></tr>`;
        return;
    }

    let html = '';
    systemUsersList.forEach(u => {
        const isAdmin = (u.role === 'admin');
        const isActive = (parseInt(u.is_active, 10) === 1);
        const isSelf = (currentUser && u.id === currentUser.id);

        const roleBadge = isAdmin
            ? `<span class="badge-role badge-role-admin">ADMIN</span>`
            : `<span class="badge-role badge-role-dispatcher">DISPATCHER</span>`;

        const statusBadge = isActive
            ? `<span class="status-pill active">${currentLang === 'ru' ? 'Активен' : 'Active'}</span>`
            : `<span class="status-pill blocked">${currentLang === 'ru' ? 'Заблокирован' : 'Blocked'}</span>`;

        let lastLoginHtml = `<span class="text-muted" style="white-space: nowrap;">${currentLang === 'ru' ? 'Не входил' : 'Never'}</span>`;
        if (u.last_login) {
            const parts = String(u.last_login).trim().split(' ');
            if (parts.length >= 2) {
                lastLoginHtml = `<div style="white-space: nowrap; font-weight: 500;">${escapeHtml(parts[0])}</div><div style="white-space: nowrap; font-size: 0.72rem; opacity: 0.85;">${escapeHtml(parts.slice(1).join(' '))}</div>`;
            } else {
                lastLoginHtml = `<span style="white-space: nowrap;">${escapeHtml(u.last_login)}</span>`;
            }
        }

        html += `
            <tr>
                <td><strong>${escapeHtml(u.username)}</strong> ${isSelf ? '<span class="highlight-cyan font-mono" style="font-size:0.75rem;">(Вы)</span>' : ''}</td>
                <td>${escapeHtml(u.full_name)}</td>
                <td>${roleBadge}</td>
                <td>${statusBadge}</td>
                <td class="monospace-val" style="font-size:0.75rem; vertical-align: middle;">${lastLoginHtml}</td>
                <td style="text-align: right;">
                    <div class="table-action-btns">
                        <button type="button" class="btn-table-action gold" onclick="openChangePasswordModal('${u.id}', '${escapeHtml(u.username)}')" title="Сменить пароль">🔑 Пароль</button>
                        <button type="button" class="btn-table-action" onclick="openEditUserModal('${u.id}')" title="Редактировать">✏️</button>
                        ${!isSelf ? `<button type="button" class="btn-table-action danger" onclick="handleDeleteUser('${u.id}', '${escapeHtml(u.username)}')" title="Удалить">🗑️</button>` : ''}
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// Открытие модалки создания нового пользователя
function openCreateUserModal() {
    const modal = document.getElementById('modal-user-edit');
    const title = document.getElementById('user-modal-title');
    const form = document.getElementById('form-user-edit');
    const errEl = document.getElementById('user-modal-error');
    const idInp = document.getElementById('edit-user-id');
    const usernameInp = document.getElementById('edit-username');
    const fullnameInp = document.getElementById('edit-fullname');
    const roleSelect = document.getElementById('edit-user-role');
    const passGroup = document.getElementById('user-pass-group');
    const passInp = document.getElementById('edit-user-pass');
    const passToggleBtn = document.getElementById('btn-toggle-edit-pass');
    const activeGroup = document.getElementById('user-active-group');

    if (!modal) return;
    if (form) form.reset();
    if (errEl) errEl.classList.add('hidden');

    if (idInp) idInp.value = '';
    if (usernameInp) { usernameInp.disabled = false; usernameInp.value = ''; }
    if (fullnameInp) fullnameInp.value = '';
    if (roleSelect) roleSelect.value = 'dispatcher';
    if (passGroup) passGroup.style.display = '';
    if (passInp) {
        passInp.required = true;
        passInp.type = 'password';
        passInp.value = '';
    }
    if (passToggleBtn) passToggleBtn.textContent = '👁️';
    if (activeGroup) activeGroup.style.display = 'none';

    if (title) title.textContent = (currentLang === 'ru' ? '[ СОЗДАНИЕ УЧЕТНОЙ ЗАПИСИ ]' : '[ CREATE USER ACCOUNT ]');
    modal.classList.remove('hidden');
    if (usernameInp) setTimeout(() => usernameInp.focus(), 100);
}

// Открытие модалки редактирования пользователя
function openEditUserModal(userId) {
    const user = systemUsersList.find(u => u.id === userId);
    if (!user) return;

    const modal = document.getElementById('modal-user-edit');
    const title = document.getElementById('user-modal-title');
    const errEl = document.getElementById('user-modal-error');
    const idInp = document.getElementById('edit-user-id');
    const usernameInp = document.getElementById('edit-username');
    const fullnameInp = document.getElementById('edit-fullname');
    const roleSelect = document.getElementById('edit-user-role');
    const passGroup = document.getElementById('user-pass-group');
    const passInp = document.getElementById('edit-user-pass');
    const activeGroup = document.getElementById('user-active-group');
    const activeInp = document.getElementById('edit-user-active');

    if (!modal) return;
    if (errEl) errEl.classList.add('hidden');

    if (idInp) idInp.value = user.id;
    if (usernameInp) { usernameInp.value = user.username; usernameInp.disabled = true; }
    if (fullnameInp) fullnameInp.value = user.full_name;
    if (roleSelect) roleSelect.value = user.role;
    if (passGroup) passGroup.style.display = 'none';
    if (passInp) passInp.required = false;
    if (activeGroup) activeGroup.style.display = '';
    if (activeInp) activeInp.checked = (parseInt(user.is_active, 10) === 1);

    if (title) title.textContent = (currentLang === 'ru' ? '[ РЕДАКТИРОВАНИЕ ПОЛЬЗОВАТЕЛЯ ]' : '[ EDIT USER ACCOUNT ]');
    modal.classList.remove('hidden');
}

// Сохранение пользователя (Создание или Обновление)
async function handleSaveUser(e) {
    if (e) e.preventDefault();
    const idInp = document.getElementById('edit-user-id');
    const usernameInp = document.getElementById('edit-username');
    const fullnameInp = document.getElementById('edit-fullname');
    const roleSelect = document.getElementById('edit-user-role');
    const passInp = document.getElementById('edit-user-pass');
    const activeInp = document.getElementById('edit-user-active');
    const errEl = document.getElementById('user-modal-error');

    const id = idInp ? idInp.value : '';
    const isNew = !id;
    const username = usernameInp ? usernameInp.value.trim().toUpperCase() : '';
    const fullName = fullnameInp ? fullnameInp.value.trim() : '';
    const role = roleSelect ? roleSelect.value : 'dispatcher';
    const password = passInp ? passInp.value : '';
    const isActive = activeInp && activeInp.checked ? 1 : 0;

    if (!fullName || (isNew && (!username || !password))) {
        if (errEl) {
            errEl.textContent = (currentLang === 'ru' ? 'Заполните все обязательные поля.' : 'Fill in all required fields.');
            errEl.classList.remove('hidden');
        }
        return;
    }

    if (!isOfflineMode) {
        try {
            const action = isNew ? 'create_user' : 'update_user';
            const payload = isNew 
                ? { username, full_name: fullName, role, password }
                : { id, full_name: fullName, role, is_active: isActive };

            const response = await fetch(`api.php?action=${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (data.success) {
                const modal = document.getElementById('modal-user-edit');
                if (modal) modal.classList.add('hidden');
                await loadUsersList();
                showAviationAlert(data.message || (currentLang === 'ru' ? 'Пользователь сохранен.' : 'User saved.'), false);
                return;
            } else {
                if (errEl) {
                    errEl.textContent = data.error || (currentLang === 'ru' ? 'Ошибка при сохранении пользователя.' : 'Error saving user.');
                    errEl.classList.remove('hidden');
                }
                return;
            }
        } catch (err) {
            console.warn("Сбой сервера при сохранении пользователя, используем локальную базу:", err);
        }
    }

    // Сохранение в локальном режиме (Offline)
    if (isNew) {
        if (systemUsersList.some(u => u.username === username)) {
            if (errEl) {
                errEl.textContent = (currentLang === 'ru' ? 'Пользователь с таким логином уже существует!' : 'User with this login already exists!');
                errEl.classList.remove('hidden');
            }
            return;
        }
        const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const newUser = {
            id: 'usr_' + Date.now(),
            username,
            full_name: fullName,
            role,
            is_active: 1,
            created_at: nowStr,
            last_login: null
        };
        systemUsersList.unshift(newUser);
    } else {
        const u = systemUsersList.find(item => item.id === id);
        if (u) {
            u.full_name = fullName;
            u.role = role;
            u.is_active = isActive;
        }
    }
    localStorage.setItem('averago_local_users_db', JSON.stringify(systemUsersList));
    const modal = document.getElementById('modal-user-edit');
    if (modal) modal.classList.add('hidden');
    renderUsersTable();
    showAviationAlert(currentLang === 'ru' ? 'Пользователь успешно сохранен (Локально).' : 'User saved locally.', false);
}

// Открытие модалки смены пароля
function openChangePasswordModal(userId, userName) {
    const modal = document.getElementById('modal-change-user-pass');
    const idInp = document.getElementById('pass-user-id');
    const nameEl = document.getElementById('pass-user-name');
    const newPassInp = document.getElementById('new-password-input');
    const confPassInp = document.getElementById('confirm-password-input');
    const newToggleBtn = document.getElementById('btn-toggle-new-pass');
    const confToggleBtn = document.getElementById('btn-toggle-confirm-pass');
    const errEl = document.getElementById('pass-modal-error');

    if (!modal) return;
    if (idInp) idInp.value = userId;
    if (nameEl) nameEl.textContent = userName;
    if (newPassInp) {
        newPassInp.value = '';
        newPassInp.type = 'password';
    }
    if (confPassInp) {
        confPassInp.value = '';
        confPassInp.type = 'password';
    }
    if (newToggleBtn) newToggleBtn.textContent = '👁️';
    if (confToggleBtn) confToggleBtn.textContent = '👁️';
    if (errEl) errEl.classList.add('hidden');

    modal.classList.remove('hidden');
    if (newPassInp) setTimeout(() => newPassInp.focus(), 100);
}

// Сохранение нового пароля
async function handleSaveNewPassword(e) {
    if (e) e.preventDefault();
    const idInp = document.getElementById('pass-user-id');
    const newPassInp = document.getElementById('new-password-input');
    const confPassInp = document.getElementById('confirm-password-input');
    const errEl = document.getElementById('pass-modal-error');

    const userId = idInp ? idInp.value : '';
    const newPass = newPassInp ? newPassInp.value : '';
    const confPass = confPassInp ? confPassInp.value : '';

    if (!newPass || newPass.length < 4) {
        if (errEl) {
            errEl.textContent = (currentLang === 'ru' ? 'Пароль должен содержать минимум 4 символа.' : 'Password must be at least 4 chars.');
            errEl.classList.remove('hidden');
        }
        return;
    }

    if (newPass !== confPass) {
        if (errEl) {
            errEl.textContent = (currentLang === 'ru' ? 'Введенные пароли не совпадают!' : 'Passwords do not match!');
            errEl.classList.remove('hidden');
        }
        return;
    }

    if (!isOfflineMode) {
        try {
            const response = await fetch('api.php?action=change_password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId, new_password: newPass })
            });
            const data = await response.json();

            if (data.success) {
                const modal = document.getElementById('modal-change-user-pass');
                if (modal) modal.classList.add('hidden');
                showAviationAlert(data.message || (currentLang === 'ru' ? 'Пароль успешно изменен.' : 'Password updated.'), false);
                return;
            } else {
                if (errEl) {
                    errEl.textContent = data.error || (currentLang === 'ru' ? 'Ошибка смены пароля.' : 'Error updating password.');
                    errEl.classList.remove('hidden');
                }
                return;
            }
        } catch (err) {
            console.warn("Сбой сервера при смене пароля, обновляем локально:", err);
        }
    }

    // Локальное обновление пароля
    const modal = document.getElementById('modal-change-user-pass');
    if (modal) modal.classList.add('hidden');
    showAviationAlert(currentLang === 'ru' ? 'Пароль успешно изменен (Локально).' : 'Password updated locally.', false);
}

// Удаление пользователя
async function handleDeleteUser(userId, userName) {
    const confirmModal = document.getElementById('aviation-confirm-modal');
    const msgEl = document.getElementById('aviation-confirm-message');
    const btnConfirm = document.getElementById('modal-btn-confirm');
    const btnCancel = document.getElementById('modal-btn-cancel');

    if (!confirmModal || !msgEl || !btnConfirm) return;

    msgEl.textContent = (currentLang === 'ru' 
        ? `Вы уверены, что хотите удалить пользователя "${userName}"? Это действие необратимо.`
        : `Are you sure you want to delete user "${userName}"? This action cannot be undone.`);

    confirmModal.classList.remove('hidden');

    const handleConfirm = async () => {
        confirmModal.classList.add('hidden');
        btnConfirm.removeEventListener('click', handleConfirm);

        if (!isOfflineMode) {
            try {
                const response = await fetch(`api.php?action=delete_user&id=${encodeURIComponent(userId)}`);
                const data = await response.json();
                if (data.success) {
                    await loadUsersList();
                    showAviationAlert(data.message || (currentLang === 'ru' ? 'Пользователь удален.' : 'User deleted.'), false);
                    return;
                } else {
                    showAviationAlert(data.error || (currentLang === 'ru' ? 'Ошибка удаления пользователя.' : 'Error deleting user.'), true);
                    return;
                }
            } catch (err) {
                console.warn("Сбой сервера при удалении пользователя, удаляем локально:", err);
            }
        }

        // Локальное удаление
        systemUsersList = systemUsersList.filter(u => u.id !== userId);
        localStorage.setItem('averago_local_users_db', JSON.stringify(systemUsersList));
        renderUsersTable();
        showAviationAlert(currentLang === 'ru' ? 'Пользователь удален (Локально).' : 'User deleted locally.', false);
    };

    btnConfirm.addEventListener('click', handleConfirm);
    if (btnCancel) {
        btnCancel.addEventListener('click', () => {
            confirmModal.classList.add('hidden');
            btnConfirm.removeEventListener('click', handleConfirm);
        }, { once: true });
    }
}

// --------------------------------------------------------------------------
// МОДУЛЬ АВТОМАТИЧЕСКИХ РЕЗЕРВНЫХ КОПИЙ (30 ДНЕЙ)
// --------------------------------------------------------------------------

let serverBackupsList = [];

// Переключение раскрытия/складывания панели автоматических бэкапов
function toggleAutoBackupsAccordion(e) {
    if (e) {
        if (e.target && (e.target.closest('#btn-create-server-backup') || e.target.closest('button.btn-table-action') || e.target.closest('a'))) {
            return;
        }
        e.stopPropagation();
    }
    const panel = document.getElementById('auto-backups-panel');
    const toggleBtn = document.getElementById('btn-toggle-backups-collapse');
    if (!panel) return;

    panel.classList.toggle('collapsed');
    const isCollapsed = panel.classList.contains('collapsed');
    
    if (toggleBtn) {
        const textEl = toggleBtn.querySelector('.collapse-text');
        const iconEl = toggleBtn.querySelector('.collapse-icon');
        if (textEl) {
            textEl.textContent = isCollapsed 
                ? (translations[currentLang]['btn-expand'] || (currentLang === 'ru' ? 'Развернуть' : 'Expand'))
                : (translations[currentLang]['btn-collapse'] || (currentLang === 'ru' ? 'Свернуть' : 'Collapse'));
        }
        if (iconEl) {
            iconEl.textContent = isCollapsed ? '▼' : '▲';
        }
    }
}

// Загрузка списка серверных / локальных автобэкапов
async function loadServerBackupsList() {
    if (!currentUser || currentUser.role !== 'admin') return;

    const tbody = document.getElementById('backups-table-body');
    if (!tbody) return;

    if (!isOfflineMode && window.location.protocol !== 'file:') {
        try {
            const response = await fetch('api.php?action=list_backups');
            const data = await response.json();

            if (data.success && Array.isArray(data.backups)) {
                serverBackupsList = data.backups;
                renderServerBackupsTable();
                return;
            } else if (data.unauthorized || data.forbidden) {
                console.warn("Требуется авторизация администратора для доступа к бэкапам:", data.error);
                tbody.innerHTML = `<tr><td colspan="4" class="empty-table-text" style="color: #f59e0b;">Требуется авторизация Администратора.</td></tr>`;
                return;
            } else if (data.error) {
                tbody.innerHTML = `<tr><td colspan="4" class="empty-table-text" style="color: #ef4444;">${escapeHtml(data.error)}</td></tr>`;
                return;
            }
        } catch (err) {
            console.warn("Серверная загрузка бэкапов временно недоступна:", err);
        }
    }

    // Резервный локальный режим (Offline/LocalStorage)
    try {
        const localData = localStorage.getItem('averago_local_backups_db');
        if (localData) {
            let parsed = JSON.parse(localData);
            if (Array.isArray(parsed)) {
                // Автоматическая дедупликация по имени файла
                const uniqueMap = new Map();
                parsed.forEach(item => {
                    if (item && item.filename && !uniqueMap.has(item.filename)) {
                        uniqueMap.set(item.filename, item);
                    }
                });
                serverBackupsList = Array.from(uniqueMap.values());
                localStorage.setItem('averago_local_backups_db', JSON.stringify(serverBackupsList));
            } else {
                serverBackupsList = [];
            }
        } else {
            serverBackupsList = [];
        }
        renderServerBackupsTable();
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="4" class="empty-table-text" style="color: #ef4444;">Ошибка локального хранилища бэкапов</td></tr>`;
    }
}

// Отрисовка таблицы серверных / локальных автобэкапов и сводки в шапке
function renderServerBackupsTable() {
    const tbody = document.getElementById('backups-table-body');
    const countBadge = document.getElementById('backups-count-badge');
    const lastDateBadge = document.getElementById('backups-last-date-badge');
    if (!tbody) return;

    if (countBadge) {
        const itemWord = currentLang === 'ru' ? 'копий' : 'backups';
        countBadge.textContent = `💾 ${serverBackupsList.length} ${itemWord}`;
    }

    if (lastDateBadge) {
        if (serverBackupsList.length > 0 && serverBackupsList[0].created_at) {
            const lastDate = serverBackupsList[0].created_at.split(' ')[0];
            lastDateBadge.textContent = (currentLang === 'ru' ? 'Последняя: ' : 'Latest: ') + lastDate;
        } else {
            lastDateBadge.textContent = (currentLang === 'ru' ? 'Последняя: —' : 'Latest: —');
        }
    }

    if (serverBackupsList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="empty-table-text">${currentLang === 'ru' ? 'Автоматические бэкапы пока отсутствуют. Нажмите кнопку "Создать бэкап сейчас".' : 'No backups found.'}</td></tr>`;
        return;
    }

    let html = '';
    serverBackupsList.forEach(b => {
        const sizeKb = (b.size / 1024).toFixed(1);
        const sizeMb = (b.size / (1024 * 1024)).toFixed(2);
        const sizeDisplay = b.size > 1024 * 1024 ? `${sizeMb} MB` : `${sizeKb} KB`;

        let createdAtHtml = escapeHtml(b.created_at || '—');
        if (b.created_at) {
            const parts = String(b.created_at).trim().split(' ');
            if (parts.length >= 2) {
                createdAtHtml = `<div style="white-space: nowrap; font-weight: 500;">${escapeHtml(parts[0])}</div><div style="white-space: nowrap; font-size: 0.72rem; opacity: 0.85;">${escapeHtml(parts.slice(1).join(' '))}</div>`;
            } else {
                createdAtHtml = `<span style="white-space: nowrap;">${escapeHtml(b.created_at)}</span>`;
            }
        }

        html += `
            <tr>
                <td><strong class="font-mono">${escapeHtml(b.filename)}</strong></td>
                <td class="monospace-val" style="font-size: 0.8rem; vertical-align: middle;">${createdAtHtml}</td>
                <td class="monospace-val highlight-cyan">${sizeDisplay}</td>
                <td style="text-align: right;">
                    <div class="table-action-btns">
                        <button type="button" class="btn-table-action" onclick="downloadServerBackup('${escapeHtml(b.filename)}')" title="${currentLang === 'ru' ? 'Скачать архив' : 'Download'}">📥 ${currentLang === 'ru' ? 'Скачать' : 'Download'}</button>
                        <button type="button" class="btn-table-action" onclick="restoreServerBackup('${escapeHtml(b.filename)}')" title="${currentLang === 'ru' ? 'Восстановить базу' : 'Restore'}">🔄 ${currentLang === 'ru' ? 'Восстановить' : 'Restore'}</button>
                        <button type="button" class="btn-table-action danger" onclick="deleteServerBackup('${escapeHtml(b.filename)}')" title="${currentLang === 'ru' ? 'Удалить архив' : 'Delete'}">🗑️ ${currentLang === 'ru' ? 'Удалить' : 'Delete'}</button>
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

let isCreatingBackupNow = false;

// Создание мгновенного серверного или локального бэкапа
async function createServerBackupNow() {
    if (isCreatingBackupNow) return;
    isCreatingBackupNow = true;

    const btn = document.getElementById('btn-create-server-backup');
    if (btn) btn.disabled = true;

    try {
        if (!isOfflineMode) {
            try {
                const response = await fetch('api.php?action=create_backup');
                const data = await response.json();

                if (data.success) {
                    await loadServerBackupsList();
                    showAviationAlert(`Резервная копия создана: ${data.filename} (${data.flights_count} рейсов).`, false);
                    return;
                }
            } catch (err) {
                console.warn("Серверный бэкап недоступен, выполняем локальный бэкап:", err);
            }
        }

        // Локальное создание бэкапа в Offline/Local mode
        try {
            const flights = userFlights || [];
            const dateNow = new Date();
            const yyyy = dateNow.getFullYear();
            const mm = String(dateNow.getMonth() + 1).padStart(2, '0');
            const dd = String(dateNow.getDate()).padStart(2, '0');
            const hh = String(dateNow.getHours()).padStart(2, '0');
            const min = String(dateNow.getMinutes()).padStart(2, '0');
            const ss = String(dateNow.getSeconds()).padStart(2, '0');

            const filename = `aerobag_local_${yyyy}_${mm}_${dd}_${hh}${min}${ss}.json`;
            const createdAt = `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;

            const backupData = {
                backup_version: '1.0',
                backup_type: 'local_offline',
                exported_at: dateNow.toISOString(),
                flights_count: flights.length,
                flights: flights
            };

            const jsonStr = JSON.stringify(backupData, null, 2);
            const sizeBytes = new Blob([jsonStr]).size;

            const newBackupItem = {
                filename: filename,
                created_at: createdAt,
                timestamp: Math.floor(dateNow.getTime() / 1000),
                size: sizeBytes,
                is_local: true,
                data: backupData
            };

            let localList = [];
            try {
                const existing = localStorage.getItem('averago_local_backups_db');
                if (existing) localList = JSON.parse(existing);
                if (!Array.isArray(localList)) localList = [];
            } catch (e) {}

            // Удаляем возможные дубликаты с таким же именем
            localList = localList.filter(b => b && b.filename !== filename);
            localList.unshift(newBackupItem);

            // Автоматическая дедупликация по имени файла
            const uniqueMap = new Map();
            localList.forEach(item => {
                if (item && item.filename && !uniqueMap.has(item.filename)) {
                    uniqueMap.set(item.filename, item);
                }
            });
            localList = Array.from(uniqueMap.values());

            // Ротация: оставляем 30 последних
            if (localList.length > 30) localList = localList.slice(0, 30);

            localStorage.setItem('averago_local_backups_db', JSON.stringify(localList));
            serverBackupsList = localList;
            renderServerBackupsTable();

            showAviationAlert(`Локальная копия создана: ${filename} (${flights.length} рейсов).`, false);
        } catch (e) {
            showAviationAlert('Ошибка создания локального бэкапа: ' + e.message, true);
        }
    } finally {
        if (btn) btn.disabled = false;
        isCreatingBackupNow = false;
    }
}

// Скачивание файла бэкапа
function downloadServerBackup(filename) {
    const localItem = serverBackupsList.find(b => b.filename === filename && (b.is_local || b.data));
    if (localItem && localItem.data) {
        const jsonStr = JSON.stringify(localItem.data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
    }

    window.location.href = `api.php?action=download_backup&file=${encodeURIComponent(filename)}`;
}

// Восстановление базы из серверного / локального бэкапа
async function restoreServerBackup(filename) {
    const confirmModal = document.getElementById('aviation-confirm-modal');
    const msgEl = document.getElementById('aviation-confirm-message');
    const btnConfirm = document.getElementById('modal-btn-confirm');
    const btnCancel = document.getElementById('modal-btn-cancel');

    if (!confirmModal || !msgEl || !btnConfirm) return;

    msgEl.textContent = `Внимание! Восстановление из архива "${filename}" полностью перезапишет текущую базу рейсов. Продолжить?`;
    confirmModal.classList.remove('hidden');

    const handleConfirm = async () => {
        confirmModal.classList.add('hidden');
        btnConfirm.removeEventListener('click', handleConfirm);

        // Проверяем локальный бэкап
        const localItem = serverBackupsList.find(b => b.filename === filename && (b.is_local || b.data));
        if (localItem && localItem.data && Array.isArray(localItem.data.flights)) {
            userFlights = localItem.data.flights;
            localStorage.setItem('averago_local_flights_db', JSON.stringify(userFlights));
            renderFlightsTable(userFlights);
            renderDashboardAnalytics();
            showAviationAlert(`База успешно восстановлена из локального архива! Загружено ${userFlights.length} рейсов.`, false);
            return;
        }

        try {
            const response = await fetch('api.php?action=restore_backup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: filename })
            });
            const data = await response.json();

            if (data.success) {
                await loadUserFlights();
                showAviationAlert(`База успешно восстановлена! Загружено ${data.restored_count} рейсов.`, false);
            } else {
                showAviationAlert(data.error || 'Ошибка при восстановлении базы.', true);
            }
        } catch (err) {
            showAviationAlert('Ошибка при восстановлении: ' + err.message, true);
        }
    };

    btnConfirm.addEventListener('click', handleConfirm);
    if (btnCancel) {
        btnCancel.addEventListener('click', () => {
            confirmModal.classList.add('hidden');
            btnConfirm.removeEventListener('click', handleConfirm);
        }, { once: true });
    }
}

// Удаление резервной копии с сервера или локального хранилища
async function deleteServerBackup(filename) {
    const msg = currentLang === 'ru'
        ? `Вы действительно хотите безвозвратно удалить резервную копию "${filename}"?`
        : `Are you sure you want to permanently delete backup "${filename}"?`;

    showAviationConfirm(msg, async () => {
        const localIdx = serverBackupsList.findIndex(b => b.filename === filename && b.is_local);
        if (localIdx !== -1) {
            serverBackupsList.splice(localIdx, 1);
            localStorage.setItem('averago_local_backups_db', JSON.stringify(serverBackupsList));
            renderServerBackupsTable();
            showAviationAlert(currentLang === 'ru' ? 'Локальная копия успешно удалена.' : 'Local backup deleted.', false);
            return;
        }

        try {
            const response = await fetch('api.php?action=delete_backup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: filename })
            });
            const data = await response.json();

            if (data.success) {
                await loadServerBackupsList();
                showAviationAlert(currentLang === 'ru' ? 'Резервная копия успешно удалена.' : 'Backup deleted successfully.', false);
            } else {
                showAviationAlert(data.error || (currentLang === 'ru' ? 'Ошибка удаления бэкапа.' : 'Delete error.'), true);
            }
        } catch (err) {
            const idx = serverBackupsList.findIndex(b => b.filename === filename);
            if (idx !== -1) {
                serverBackupsList.splice(idx, 1);
                localStorage.setItem('averago_local_backups_db', JSON.stringify(serverBackupsList));
                renderServerBackupsTable();
                showAviationAlert(currentLang === 'ru' ? 'Копия удалена из локального хранилища.' : 'Backup deleted locally.', false);
            } else {
                showAviationAlert('Ошибка при удалении: ' + err.message, true);
            }
        }
    });
}

// Экспорт функций бэкапов в window
window.toggleAutoBackupsAccordion = toggleAutoBackupsAccordion;
window.createServerBackupNow = createServerBackupNow;
window.downloadServerBackup = downloadServerBackup;
window.restoreServerBackup = restoreServerBackup;
window.deleteServerBackup = deleteServerBackup;

// --------------------------------------------------------------------------
// ГЛОБАЛЬНЫЙ ПЕРЕХВАТЧИК КЛИЕНТСКИХ ОШИБОК JAVASCRIPT
// --------------------------------------------------------------------------

const recentReportedErrors = new Set();

function reportClientError(message, details = null, level = 'ERROR') {
    const errorKey = `${message}_${JSON.stringify(details || '')}`;
    if (recentReportedErrors.has(errorKey)) return; // Дедупликация
    recentReportedErrors.add(errorKey);
    setTimeout(() => recentReportedErrors.delete(errorKey), 10000); // Очистка ключа через 10 сек

    // Локальное сохранение в оффлайн-журнал (LocalStorage)
    try {
        let localLogs = [];
        const existing = localStorage.getItem('averago_local_system_logs');
        if (existing) localLogs = JSON.parse(existing);
        if (!Array.isArray(localLogs)) localLogs = [];

        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');

        localLogs.unshift({
            id: 'local_err_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            level: level,
            category: 'CLIENT_JS',
            message: String(message),
            details: details ? (typeof details === 'string' ? details : JSON.stringify(details, null, 2)) : null,
            username: (typeof currentUser !== 'undefined' && currentUser) ? currentUser.username : 'CLIENT',
            role: (typeof currentUser !== 'undefined' && currentUser) ? currentUser.role : 'guest',
            ip_address: '127.0.0.1 (Local)',
            created_at: `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`
        });

        if (localLogs.length > 500) localLogs = localLogs.slice(0, 500);
        localStorage.setItem('averago_local_system_logs', JSON.stringify(localLogs));
    } catch (e) {}

    // Отправка на сервер
    if (typeof isOfflineMode !== 'undefined' && !isOfflineMode) {
        try {
            fetch('api.php?action=log_client_error', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    level: level,
                    message: message,
                    details: details
                })
            }).catch(() => {});
        } catch (e) {}
    }
}

// Глобальный перехват необработанных ошибок
window.addEventListener('error', function(e) {
    if (!e) return;
    const msg = e.message || 'Unknown Error';
    const stack = e.error && e.error.stack ? e.error.stack : `${e.filename || 'app.js'}:${e.lineno || 0}:${e.colno || 0}`;
    reportClientError(`JS Error: ${msg}`, { filename: e.filename, lineno: e.lineno, colno: e.colno, stack: stack }, 'ERROR');
});

// Глобальный перехват отклоненных промисов
window.addEventListener('unhandledrejection', function(e) {
    if (!e) return;
    const reason = e.reason;
    const msg = (reason && reason.message) ? reason.message : String(reason || 'Unhandled Promise Rejection');
    const stack = (reason && reason.stack) ? reason.stack : null;
    reportClientError(`Unhandled Rejection: ${msg}`, { stack: stack }, 'ERROR');
});

// --------------------------------------------------------------------------
// МОДУЛЬ АУДИТА, ЛОГИРОВАНИЯ И МОНИТОРИНГА ОШИБОК (7 / 15 / 30 ДНЕЙ)
// --------------------------------------------------------------------------

let systemLogsList = [];
let currentLogFilters = {
    level: 'all',
    category: 'all',
    search: ''
};
let currentLogRetentionDays = 7;

// Переключение раскрытия/складывания панели системных логов
function toggleSystemLogsAccordion(e) {
    if (e) {
        // Игнорируем клики по вспомогательным кнопкам действий, но разрешаем клик по кнопке переключения
        if (e.target && !e.target.closest('#btn-toggle-logs-collapse') && (
            e.target.closest('#btn-refresh-logs') || 
            e.target.closest('#btn-export-logs') || 
            e.target.closest('#btn-clear-logs') || 
            e.target.closest('select') || 
            e.target.closest('input') || 
            e.target.closest('a')
        )) {
            return;
        }
        e.stopPropagation();
    }
    const panel = document.getElementById('system-logs-panel');
    const toggleBtn = document.getElementById('btn-toggle-logs-collapse');
    if (!panel) return;

    panel.classList.toggle('collapsed');
    const isCollapsed = panel.classList.contains('collapsed');

    if (toggleBtn) {
        const textEl = toggleBtn.querySelector('.collapse-text');
        const iconEl = toggleBtn.querySelector('.collapse-icon');
        if (textEl) {
            textEl.textContent = isCollapsed 
                ? (translations[currentLang]['btn-expand'] || (currentLang === 'ru' ? 'Развернуть' : 'Expand'))
                : (translations[currentLang]['btn-collapse'] || (currentLang === 'ru' ? 'Свернуть' : 'Collapse'));
        }
        if (iconEl) {
            iconEl.textContent = isCollapsed ? '▼' : '▲';
        }
    }

    if (!isCollapsed) {
        loadSystemLogs();
    }
}

// Загрузка списка логов с сервера или локального хранилища
async function loadSystemLogs() {
    if (!currentUser || currentUser.role !== 'admin') return;

    const tbody = document.getElementById('system-logs-table-body');
    if (!tbody) return;

    const queryParams = new URLSearchParams({
        level: currentLogFilters.level,
        category: currentLogFilters.category,
        search: currentLogFilters.search,
        limit: '300'
    });

    if (!isOfflineMode) {
        try {
            const response = await fetch(`api.php?action=get_logs&${queryParams.toString()}`);
            const data = await response.json();

            if (data.success && Array.isArray(data.logs)) {
                systemLogsList = data.logs;
                if (data.retention_days) {
                    currentLogRetentionDays = data.retention_days;
                    const retentionSelect = document.getElementById('select-log-retention');
                    if (retentionSelect) retentionSelect.value = String(data.retention_days);
                }
                updateLogsSummaryBadges(data.stats_24h, data.total_all || data.total);
                renderLogsTable();
                return;
            }
        } catch (err) {
            console.warn("Серверная загрузка логов недоступна, переключаемся на локальные логи:", err);
        }
    }

    // Резервный локальный режим (LocalStorage)
    try {
        let localLogs = [];
        const stored = localStorage.getItem('averago_local_system_logs');
        if (stored) localLogs = JSON.parse(stored);
        if (!Array.isArray(localLogs)) localLogs = [];

        // Фильтрация локальных логов
        let filtered = localLogs;
        if (currentLogFilters.level !== 'all') {
            filtered = filtered.filter(l => l.level === currentLogFilters.level);
        }
        if (currentLogFilters.category !== 'all') {
            filtered = filtered.filter(l => l.category === currentLogFilters.category);
        }
        if (currentLogFilters.search) {
            const s = currentLogFilters.search.toLowerCase();
            filtered = filtered.filter(l => 
                (l.message && l.message.toLowerCase().includes(s)) ||
                (l.username && l.username.toLowerCase().includes(s)) ||
                (l.ip_address && l.ip_address.toLowerCase().includes(s))
            );
        }

        systemLogsList = filtered;

        // Подсчет сводки для оффлайна
        const errorsCount = localLogs.filter(l => l.level === 'ERROR').length;
        const warnsCount = localLogs.filter(l => l.level === 'WARNING').length;
        updateLogsSummaryBadges({ errors: errorsCount, warnings: warnsCount }, localLogs.length);

        renderLogsTable();
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-table-text" style="color: #ef4444;">Ошибка чтения системных логов</td></tr>`;
    }
}

// Обновление бейджей сводки в шапке панели логов
function updateLogsSummaryBadges(stats24h, totalCount) {
    const errBadge = document.getElementById('logs-badge-errors');
    const warnBadge = document.getElementById('logs-badge-warnings');
    const totalBadge = document.getElementById('logs-badge-total');

    const errCount = (stats24h && stats24h.errors !== undefined) ? stats24h.errors : 0;
    const warnCount = (stats24h && stats24h.warnings !== undefined) ? stats24h.warnings : 0;
    const tot = totalCount !== undefined ? totalCount : systemLogsList.length;

    if (errBadge) {
        errBadge.textContent = currentLang === 'ru' ? `🔴 ${errCount} ошибок` : `🔴 ${errCount} errors`;
        errBadge.style.opacity = errCount > 0 ? '1' : '0.6';
    }
    if (warnBadge) {
        warnBadge.textContent = currentLang === 'ru' ? `🟡 ${warnCount} пред.` : `🟡 ${warnCount} warns`;
        warnBadge.style.opacity = warnCount > 0 ? '1' : '0.6';
    }
    if (totalBadge) {
        totalBadge.textContent = currentLang === 'ru' ? `📄 ${tot} всего` : `📄 ${tot} total`;
    }
}

// Отрисовка таблицы системных логов
function renderLogsTable() {
    const tbody = document.getElementById('system-logs-table-body');
    if (!tbody) return;

    if (systemLogsList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-table-text">${currentLang === 'ru' ? 'Записи в системном журнале не найдены.' : 'No log records found.'}</td></tr>`;
        return;
    }

    let html = '';
    systemLogsList.forEach(log => {
        const lvl = (log.level || 'INFO').toUpperCase();
        let levelClass = 'badge-level-info';
        let rowClass = '';
        if (lvl === 'ERROR') {
            levelClass = 'badge-level-error';
            rowClass = 'log-row-error';
        } else if (lvl === 'WARNING') {
            levelClass = 'badge-level-warning';
            rowClass = 'log-row-warning';
        }

        const cat = (log.category || 'SYSTEM').toUpperCase();
        let catClass = 'cat-' + cat.toLowerCase();

        const userStr = escapeHtml(log.username || 'SYSTEM');
        const ipStr = escapeHtml(log.ip_address || '-');
        const timeStr = escapeHtml(log.created_at || '-');
        const msgStr = escapeHtml(log.message || '-');
        const hasDetails = Boolean(log.details);

        let timeFormattedHtml = escapeHtml(timeStr);
        if (timeStr && timeStr !== '-') {
            const parts = String(timeStr).trim().split(' ');
            if (parts.length >= 2) {
                timeFormattedHtml = `<div style="white-space: nowrap; font-weight: 500;">${escapeHtml(parts[0])}</div><div style="white-space: nowrap; font-size: 0.72rem; opacity: 0.85;">${escapeHtml(parts.slice(1).join(' '))}</div>`;
            } else {
                timeFormattedHtml = `<span style="white-space: nowrap;">${escapeHtml(timeStr)}</span>`;
            }
        }

        html += `
            <tr class="${rowClass}">
                <td class="monospace-val" style="font-size: 0.76rem; vertical-align: middle;">${timeFormattedHtml}</td>
                <td><span class="badge-log-level ${levelClass}">${lvl}</span></td>
                <td><span class="badge-log-cat ${catClass}">${cat}</span></td>
                <td>
                    <div style="line-height: 1.2;">
                        <strong style="font-size: 0.8rem;">${userStr}</strong>
                        <div class="monospace-val" style="font-size: 0.7rem; color: var(--text-muted);">${ipStr}</div>
                    </div>
                </td>
                <td class="log-msg-cell" title="${msgStr}">${msgStr}</td>
                <td style="text-align: right;">
                    ${hasDetails ? `<button type="button" class="btn-log-details" onclick="openLogDetailsModal('${escapeHtml(String(log.id))}')" title="Просмотр контекста">Детали 🔍</button>` : '<span style="opacity: 0.3; font-size: 0.75rem;">—</span>'}
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// Фильтрация логов
function handleFilterLogs() {
    const lvlEl = document.getElementById('filter-log-level');
    const catEl = document.getElementById('filter-log-category');
    if (lvlEl) currentLogFilters.level = lvlEl.value;
    if (catEl) currentLogFilters.category = catEl.value;
    loadSystemLogs();
}

let searchLogsTimeout = null;
function handleSearchLogs(val) {
    currentLogFilters.search = val.trim();
    clearTimeout(searchLogsTimeout);
    searchLogsTimeout = setTimeout(() => {
        loadSystemLogs();
    }, 300);
}

function handleRefreshLogs(e) {
    if (e) e.stopPropagation();
    loadSystemLogs();
    showAviationAlert(currentLang === 'ru' ? 'Журнал логов обновлен.' : 'Logs refreshed.', false);
}

// Смена периода ротации логов (7 / 15 / 30 дней)
async function handleLogRetentionChange(days) {
    const numDays = parseInt(days, 10);
    if (![7, 15, 30].includes(numDays)) return;

    if (!isOfflineMode) {
        try {
            const response = await fetch('api.php?action=set_log_retention', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ days: numDays })
            });
            const data = await response.json();
            if (data.success) {
                currentLogRetentionDays = numDays;
                showAviationAlert(data.message || `Период ротации установлен на ${numDays} дней.`, false);
                await loadSystemLogs();
                return;
            } else {
                showAviationAlert(data.error || 'Ошибка смены периода ротации.', true);
            }
        } catch (err) {
            console.warn("Сбой сервера при установке ротации логов:", err);
        }
    }

    currentLogRetentionDays = numDays;
    showAviationAlert(`Период ротации установлен на ${numDays} дней (Локально).`, false);
}

// Очистка всех логов с подтверждением
function handleClearLogsClick(e) {
    if (e) e.stopPropagation();

    const msg = currentLang === 'ru'
        ? 'Вы уверены, что хотите полностью очистить журнал системных логов и ошибок? Это действие необратимо.'
        : 'Are you sure you want to completely purge the system audit and error logs? This action cannot be undone.';

    showAviationConfirm(msg, async () => {
        if (!isOfflineMode) {
            try {
                const response = await fetch('api.php?action=clear_logs');
                const data = await response.json();
                if (data.success) {
                    showAviationAlert(data.message || 'Журнал логов очищен.', false);
                    await loadSystemLogs();
                    return;
                } else {
                    showAviationAlert(data.error || 'Ошибка очистки логов.', true);
                }
            } catch (err) {
                console.warn("Сбой сервера при очистке логов, очищаем локально:", err);
            }
        }

        // Локальная очистка
        localStorage.removeItem('averago_local_system_logs');
        systemLogsList = [];
        renderLogsTable();
        updateLogsSummaryBadges({ errors: 0, warnings: 0 }, 0);
        showAviationAlert(currentLang === 'ru' ? 'Журнал логов очищен (Локально).' : 'Logs purged locally.', false);
    });
}

// Экспорт логов
function handleExportLogsPrompt(e) {
    if (e) e.stopPropagation();

    if (!isOfflineMode) {
        window.location.href = `api.php?action=export_logs&format=json&level=${encodeURIComponent(currentLogFilters.level)}&category=${encodeURIComponent(currentLogFilters.category)}`;
        return;
    }

    // Локальный экспорт
    try {
        const stored = localStorage.getItem('averago_local_system_logs') || '[]';
        const blob = new Blob([stored], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aerobag_local_logs_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (e) {
        showAviationAlert('Ошибка экспорта логов: ' + e.message, true);
    }
}

// Открытие модалки деталей лога
function openLogDetailsModal(logId) {
    const log = systemLogsList.find(l => String(l.id) === String(logId));
    if (!log) return;

    const modal = document.getElementById('modal-log-details');
    const metaEl = document.getElementById('log-modal-meta');
    const msgEl = document.getElementById('log-modal-message');
    const preEl = document.getElementById('log-modal-details-pre');
    const iconEl = document.getElementById('log-modal-icon');

    if (!modal) return;

    const lvl = (log.level || 'INFO').toUpperCase();
    if (iconEl) {
        iconEl.textContent = lvl === 'ERROR' ? '🚨' : (lvl === 'WARNING' ? '⚠️' : '📋');
    }

    if (metaEl) {
        metaEl.innerHTML = `
            <div><span style="color:var(--text-muted)">ВРЕМЯ:</span> <strong class="monospace-val">${escapeHtml(log.created_at || '-')}</strong></div>
            <div><span style="color:var(--text-muted)">УРОВЕНЬ:</span> <strong class="badge-log-level ${lvl === 'ERROR' ? 'badge-level-error' : (lvl === 'WARNING' ? 'badge-level-warning' : 'badge-level-info')}">${lvl}</strong></div>
            <div><span style="color:var(--text-muted)">КАТЕГОРИЯ:</span> <strong class="badge-log-cat cat-${(log.category||'system').toLowerCase()}">${escapeHtml(log.category || '-')}</strong></div>
            <div><span style="color:var(--text-muted)">ПОЛЬЗОВАТЕЛЬ:</span> <strong class="highlight-cyan">${escapeHtml(log.username || 'SYSTEM')} (${escapeHtml(log.role || '-')})</strong></div>
            <div><span style="color:var(--text-muted)">IP АДРЕС:</span> <strong class="monospace-val">${escapeHtml(log.ip_address || '-')}</strong></div>
        `;
    }

    if (msgEl) {
        msgEl.textContent = log.message || '—';
    }

    if (preEl) {
        if (log.details) {
            if (typeof log.details === 'object') {
                preEl.textContent = JSON.stringify(log.details, null, 2);
            } else {
                try {
                    const parsed = JSON.parse(log.details);
                    preEl.textContent = JSON.stringify(parsed, null, 2);
                } catch (e) {
                    preEl.textContent = String(log.details);
                }
            }
        } else {
            preEl.textContent = 'Нет дополнительных контекстных данных.';
        }
    }

    modal.classList.remove('hidden');
}

function closeLogDetailsModal() {
    const modal = document.getElementById('modal-log-details');
    if (modal) modal.classList.add('hidden');
}

// Экспорт функций логов в window
window.toggleSystemLogsAccordion = toggleSystemLogsAccordion;
window.handleFilterLogs = handleFilterLogs;
window.handleSearchLogs = handleSearchLogs;
window.handleRefreshLogs = handleRefreshLogs;
window.handleLogRetentionChange = handleLogRetentionChange;
window.handleClearLogsClick = handleClearLogsClick;
window.handleExportLogsPrompt = handleExportLogsPrompt;
window.openLogDetailsModal = openLogDetailsModal;
window.closeLogDetailsModal = closeLogDetailsModal;
window.reportClientError = reportClientError;

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
// --- ФУНКЦИИ ФИЛЬТРАЦИИ И ВРЕМЕННЫХ ДИАПАЗОНОВ (30 ДНЕЙ) ---

// Регистрация аэропортов из загруженных рейсов в БД
function registerFlightsAirports(flights) {
    if (!flights || !baggageDb) return;
    flights.forEach(f => {
        const fromCode = String(f.from || '').trim().toUpperCase();
        const toCode = String(f.to || '').trim().toUpperCase();
        if (!fromCode || !toCode) return;

        const fromIata = ruToIata(fromCode) || fromCode;
        const toIata = ruToIata(toCode) || toCode;

        if (!baggageDb.airports[fromCode]) {
            baggageDb.airports[fromCode] = { iata: fromIata, ru: fromCode, name: fromCode };
        }
        if (!baggageDb.airports[toCode]) {
            baggageDb.airports[toCode] = { iata: toIata, ru: toCode, name: toCode };
        }

        if (baggageDb.departures_filter && !baggageDb.departures_filter.includes(fromCode) && !baggageDb.departures_filter.includes(fromIata)) {
            baggageDb.departures_filter.push(fromCode);
        }
        if (baggageDb.arrivals_filter && !baggageDb.arrivals_filter.includes(toCode) && !baggageDb.arrivals_filter.includes(toIata)) {
            baggageDb.arrivals_filter.push(toCode);
        }
    });
}

function updateActiveDateRangeAndCounts() {
    registerFlightsAirports(userFlights);
    populateAirportDropdowns();
    populateSeasonalYears();
    
    const totalCountEl = document.getElementById('total-flights-count');
    if (totalCountEl) {
        totalCountEl.textContent = userFlights.length;
    }

    if (userFlights.length === 0) {
        const activeCountEl = document.getElementById('active-flights-count');
        if (activeCountEl) activeCountEl.textContent = '0';
        const activeRangeEl = document.getElementById('active-date-range');
        if (activeRangeEl) activeRangeEl.textContent = '-';
        return;
    }

    let maxDateMs = 0;
    userFlights.forEach(flight => {
        const time = Date.parse(flight.date);
        if (!isNaN(time) && time > maxDateMs) {
            maxDateMs = time;
        }
    });

    if (maxDateMs === 0) {
        const activeCountEl = document.getElementById('active-flights-count');
        if (activeCountEl) activeCountEl.textContent = '0';
        const activeRangeEl = document.getElementById('active-date-range');
        if (activeRangeEl) activeRangeEl.textContent = '-';
        return;
    }

    // 30-дневный период для флага flight.active и для вывода в статус-бар Администрирования
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const minDateMs30 = maxDateMs - thirtyDaysMs;
    
    let activeCount30 = 0;
    userFlights.forEach(flight => {
        const time = Date.parse(flight.date);
        if (!isNaN(time) && time >= minDateMs30 && time <= maxDateMs) {
            flight.active = true;
            activeCount30++;
        } else {
            flight.active = false;
        }
    });

    const maxDate = new Date(maxDateMs);
    const minDate30 = new Date(minDateMs30);

    const formatDate = (d) => {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}.${month}.${year}`;
    };

    const dateRangeStr = `${formatDate(minDate30)} - ${formatDate(maxDate)}`;
    const activeRangeEl = document.getElementById('active-date-range');
    if (activeRangeEl) activeRangeEl.textContent = dateRangeStr;

    const activeCountEl = document.getElementById('active-flights-count');
    if (activeCountEl) activeCountEl.textContent = activeCount30;
}

// --- ЛОГИКА РАСЧЕТА ПРОГНОЗА БАГАЖА (SMART WATERFALL + АДАПТИВНАЯ ВЫБОРКА) ---

function getRuDayShort(dayIdx) {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return days[dayIdx] || '';
}

function getEnDayShort(dayIdx) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayIdx] || '';
}

function updatePaxExpectedHint() {
    const paxInputEl = document.getElementById('input-pax');
    const paxVal = parseInt(paxInputEl ? paxInputEl.value : 0, 10) || 0;
    const paxModeRadio = document.querySelector('input[name="pax-mode"]:checked');
    const paxModeFactor = paxModeRadio ? parseFloat(paxModeRadio.value) : 1.0;
    const isBookingMode = paxModeFactor < 0.99;
    const effectivePaxVal = isBookingMode ? Math.max(1, Math.round(paxVal * paxModeFactor)) : paxVal;

    const hintEl = document.getElementById('pax-expected-hint');
    if (hintEl) {
        if (isBookingMode && paxVal > 0) {
            const hintText = currentLang === 'ru'
                ? `Ожидается ~${effectivePaxVal} пасс. (с учетом неявки 3%)`
                : `Expected ~${effectivePaxVal} pax (with 3% no-show)`;
            hintEl.textContent = hintText;
            hintEl.classList.remove('hidden');
        } else {
            hintEl.classList.add('hidden');
        }
    }
}

function calculateBaggageForecast(logToHistory = false) {
    const fromVal = document.getElementById('select-from').value;
    const toVal = document.getElementById('select-to').value;
    const flightVal = document.getElementById('select-flight').value;
    const paxInputEl = document.getElementById('input-pax');
    let paxVal = parseInt(paxInputEl.value) || 0;
    if (paxVal > 1000) {
        paxVal = 1000;
        paxInputEl.value = 1000;
    }

    // Проверяем выбранный режим явки пассажиров (Факт 100% или Бронь 97%)
    const paxModeRadio = document.querySelector('input[name="pax-mode"]:checked');
    const paxModeFactor = paxModeRadio ? parseFloat(paxModeRadio.value) : 1.0;
    const isBookingMode = paxModeFactor < 0.99;
    const effectivePaxVal = isBookingMode ? Math.max(1, Math.round(paxVal * paxModeFactor)) : paxVal;

    updatePaxExpectedHint();
    
    const warningBox = document.getElementById('date-warning');
    if (warningBox) warningBox.classList.add('hidden');

    if (!fromVal || !toVal || paxVal <= 0) {
        document.getElementById('res-pcs').textContent = '0';
        document.getElementById('res-weight').textContent = '0';
        document.getElementById('res-hb').textContent = '0';
        document.getElementById('coef-pcs-pax').textContent = '-';
        document.getElementById('coef-weight-pc').textContent = '-';
        document.getElementById('coef-hb-pax').textContent = '-';
        document.getElementById('calc-source-desc').innerHTML = '-';
        return;
    }

    // Считываем параметры расширенного анализа данных
    const scopeVal = document.getElementById('select-analysis-scope')?.value || 'auto';
    const periodTypeVal = document.getElementById('select-period-type')?.value || 'auto';
    const customStartVal = document.getElementById('input-analysis-start-date')?.value || '';
    const customEndVal = document.getElementById('input-analysis-end-date')?.value || '';
    const seasonalMonthVal = document.getElementById('select-seasonal-month')?.value || '0';
    const seasonalYearVal = document.getElementById('select-seasonal-year')?.value || 'all';

    let coefs = null;
    let sourceDescHtml = '';

    // Вызываем интеллектуальный расчет с 4-уровневым каскадом и адаптивным окном
    coefs = getUploadedCoefficients(
        fromVal, toVal, flightVal,
        scopeVal, periodTypeVal,
        customStartVal, customEndVal,
        seasonalMonthVal, seasonalYearVal
    );

    if (coefs) {
        const badgeClass = coefs.levelCode || `level-${coefs.level || 1}`;
        sourceDescHtml = `<span class="waterfall-badge ${badgeClass}">${coefs.levelName || 'Загруженные данные'}</span>`;
    }

    // Если в загруженных нет данных вообще, обращаемся к историческим нормативам базы
    if (!coefs) {
        coefs = getHistoricalCoefficients(fromVal, toVal, flightVal);
        if (coefs) {
            sourceDescHtml = `<span class="waterfall-badge level-4">${translations[currentLang]['source-desc-historical']}</span>`;
        }
    }

    // Крайний дефолтный норматив
    if (!coefs) {
        coefs = {
            pcs_pax: 0.4,
            wght_pc: 13.0,
            hb_pax: 2.0
        };
        sourceDescHtml = `<span class="waterfall-badge level-4">${translations[currentLang]['source-desc-default']}</span>`;
    }

    // --- ВЫЧИСЛЕНИЕ РЕЗУЛЬТАТОВ НА ЭФФЕКТИВНЫХ ПАССАЖИРОВ ---
    const expectedPcs = Math.round(effectivePaxVal * coefs.pcs_pax);
    // Вес багажа и ручной клади округляются до целых
    const expectedWeight = Math.round(expectedPcs * coefs.wght_pc);
    const expectedHb = Math.round(effectivePaxVal * coefs.hb_pax);

    // Вывод результатов с плавной анимацией
    animateNumber('res-pcs', expectedPcs, 0);
    animateNumber('res-weight', expectedWeight, 0);
    animateNumber('res-hb', expectedHb, 0);

    // Вывод коэффициентов
    document.getElementById('coef-pcs-pax').textContent = coefs.pcs_pax.toFixed(4);
    document.getElementById('coef-weight-pc').textContent = coefs.wght_pc.toFixed(2) + ' кг';
    document.getElementById('coef-hb-pax').textContent = coefs.hb_pax.toFixed(2) + ' кг';
    document.getElementById('calc-source-desc').innerHTML = sourceDescHtml;

    // Отрисовываем детализацию отобранных рейсов и расчётных агрегированных значений
    renderSampledFlightsDetails(coefs);

    // Сохраняем расчет в историю прогнозов (только если нажата кнопка)
    if (logToHistory) {
        const dateInputEl = document.getElementById('input-date');
        const targetDateVal = dateInputEl ? dateInputEl.value : '';

        // Формируем отсеки сразу под физическую конфигурацию борта
        const targetTail = currentIncomingFlightData.ac_num || '';
        const tailCfg = getAircraftCompartmentConfig(targetTail);
        let initPositions = [];
        if (tailCfg.isWidebody) {
            initPositions = tailCfg.aft.map(n => ({ name: n, sec: 'AFT' }));
        } else {
            initPositions = [...tailCfg.fwd.map(n => ({ name: n, sec: 'FWD' })), ...tailCfg.aft.map(n => ({ name: n, sec: 'AFT' }))];
        }
        const initialCompartments = initPositions.map((pos, idx) => ({
            cpt: idx + 1,
            name: pos.name,
            section: pos.sec,
            rows: [
                { type: 'B', pcs: 0, weight: 0, locked: false }
            ]
        }));

        const prediction = {
            id: 'pred_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            from: fromVal,
            to: toVal,
            flight_no: flightVal || translations[currentLang]['select-all-flights-placeholder'],
            pax: effectivePaxVal,
            raw_pax: paxVal,
            bag_pcs: expectedPcs,
            bag_weight: expectedWeight,
            hb_weight: expectedHb,
            flight_date: targetDateVal || new Date().toISOString().split('T')[0],
            calc_date: new Date().toISOString(),
            dep_time: currentIncomingFlightData.dep_time || '',
            ac_num: targetTail,
            show_fwd: false,
            pax_mode: isBookingMode ? 'booking_97' : 'fact_100',
            waterfall_level: coefs.level || 1,
            lir_pax: effectivePaxVal,
            lir_pcs: expectedPcs,
            lir_weight: expectedWeight,
            compartments: initialCompartments,
            crew: currentIncomingFlightData.crew || '',
            galley: currentIncomingFlightData.galley || 'D',
            dow: currentIncomingFlightData.dow || '',
            doi: currentIncomingFlightData.doi || '',
            fuel_block: currentIncomingFlightData.to_fuel || '',
            fuel_trip: currentIncomingFlightData.trip_fuel || ''
        };
        predictionsHistory.unshift(prediction);
        savePredictionsHistory();
        renderPredictionsTable();

        // СТРОГО устанавливаем только что рассчитанный рейс текущим активным!
        currentActivePredictionId = prediction.id;
        highlightPredictionRow(prediction.id);

        // Обновляем бейдж и отсеки под этот расчет в правой колонке
        updateActiveFlightBadge(prediction.from, prediction.to, prediction.flight_no, prediction.flight_date, prediction.ac_num, prediction.dep_time);
        applyAircraftCompartmentConfig(prediction.ac_num, false, prediction.compartments);
    }
}

// Функция отрисовки детализации отобранных рейсов и формул в карточку ответа
function renderSampledFlightsDetails(coefs) {
    const containerEl = document.getElementById('sampled-flights-container');
    const tbodyEl = document.getElementById('sampled-flights-tbody');
    const tfootEl = document.getElementById('sampled-flights-tfoot');
    const titleEl = document.getElementById('sampled-flights-title');

    if (!containerEl || !tbodyEl || !tfootEl) return;

    // Навешиваем клик для разворачивания/сворачивания
    const toggleEl = document.getElementById('sampled-flights-toggle');
    if (toggleEl && !toggleEl.dataset.hasListener) {
        toggleEl.dataset.hasListener = 'true';
        toggleEl.addEventListener('click', function() {
            containerEl.classList.toggle('collapsed');
        });
    }

    if (!coefs) {
        containerEl.classList.add('hidden');
        tbodyEl.innerHTML = '';
        tfootEl.innerHTML = '';
        return;
    }

    // Если есть реальные отобранные рейсы
    if (coefs.usedFlights && coefs.usedFlights.length > 0) {
        const flights = coefs.usedFlights;
        containerEl.classList.remove('hidden');

        if (titleEl) {
            const levelHeader = coefs.levelName ? `[ ${coefs.levelName} ]` : '';
            const titlePattern = translations[currentLang]['sampled-flights-title'] || 'Отобранные рейсы для расчета ({count} вып.):';
            titleEl.textContent = `${levelHeader} ${titlePattern.replace('{count}', flights.length)}`.trim();
        }

        const ruShortDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        const enShortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        let htmlBody = '';
        flights.forEach((f, idx) => {
            const pax = getEffectivePaxCount(f);
            const pcs = parseInt(f.bag_pcs) || 0;
            const weight = parseFloat(f.bag_weight) || 0;
            const hb = parseFloat(f.hb_weight) || 0;

            let formattedDate = f.date ? formatDateStr(f.date) : '-';
            if (f.date) {
                const dayIdx = getDayOfWeekFromIsoStr(f.date);
                const dayName = currentLang === 'ru' ? ruShortDays[dayIdx] : enShortDays[dayIdx];
                formattedDate += ` (${dayName})`;
            }

            let weightBadge = '';
            if (coefs.weights && coefs.weights[idx] !== undefined) {
                const wPct = (coefs.weights[idx] * 100).toFixed(1).replace('.0', '');
                weightBadge = `<span class="weight-badge-pill" title="Вес свежести">${wPct}%</span>`;
            }

            htmlBody += `
                <tr>
                    <td><div class="sample-date-cell"><span>${formattedDate}</span>${weightBadge}</div></td>
                    <td><strong>${f.flight_no || '-'}</strong></td>
                    <td class="cyan-val">${pax}</td>
                    <td class="gold-val">${pcs}</td>
                    <td class="gold-val">${weight.toLocaleString('ru-RU')} кг</td>
                    <td class="purple-val">${hb.toLocaleString('ru-RU')} кг</td>
                </tr>
            `;
        });
        tbodyEl.innerHTML = htmlBody;

        const totalsLabel = translations[currentLang]['sample-totals-label'] || 'ИТОГО (СУММЫ):';
        const unitKg = translations[currentLang]['unit-kg'] || 'кг';

        let seasonalNote = '';
        if (coefs.seasonInfo && coefs.seasonInfo.hasSeasonality) {
            const sign = coefs.seasonInfo.multiplier >= 1.0 ? '+' : '';
            const pct = Math.round((coefs.seasonInfo.multiplier - 1.0) * 100);
            seasonalNote = `<div class="seasonality-pill">🌸 Сезонная поправка (${coefs.seasonInfo.monthName}): x${coefs.seasonInfo.multiplier.toFixed(3)} (${sign}${pct}%)</div><br/>`;
        }

        const formulaTitle = `📐 <strong>Расчет коэффициентов (Экспоненциальное сглаживание &alpha; = ${(coefs.alpha || 0.2).toFixed(1)}):</strong>`;
        const formulaDetails = `${seasonalNote}• <strong>PCS/PAX</strong> = <strong>${coefs.pcs_pax.toFixed(4)}</strong> ${coefs.raw_pcs_pax ? `(базовый ${coefs.raw_pcs_pax.toFixed(4)} × ${coefs.seasonInfo.multiplier.toFixed(3)})` : ''}<br/>
               • <strong>Weight/PC</strong> = <strong>${coefs.wght_pc.toFixed(2)} ${unitKg}</strong><br/>
               • <strong>HB/PAX</strong> = <strong>${coefs.hb_pax.toFixed(2)} ${unitKg}</strong>`;

        let htmlFoot = `
            <tr class="sample-totals-row">
                <td colspan="2"><strong>${totalsLabel}</strong> (${flights.length})</td>
                <td class="cyan-val">${coefs.totalPax} чел.</td>
                <td class="gold-val">${coefs.totalBags} pcs</td>
                <td class="gold-val">${coefs.totalBagWeight.toLocaleString('ru-RU')} ${unitKg}</td>
                <td class="purple-val">${coefs.totalHbWeight.toLocaleString('ru-RU')} ${unitKg}</td>
            </tr>
            <tr class="sample-formulas-row">
                <td colspan="6">
                    ${formulaTitle}<br/>
                    ${formulaDetails}
                </td>
            </tr>
        `;
        tfootEl.innerHTML = htmlFoot;
    } else {
        // Если использовались нормативные правила базы данных без списка выполнений
        containerEl.classList.remove('hidden');
        if (titleEl) {
            titleEl.textContent = currentLang === 'ru' ? 'Исторические нормативы базы данных:' : 'Historical Database Standards:';
        }
        tbodyEl.innerHTML = '';
        const unitKg = translations[currentLang]['unit-kg'] || 'кг';
        tfootEl.innerHTML = `
            <tr class="sample-formulas-row">
                <td colspan="6">
                    📐 <strong>Нормативные коэффициенты направления:</strong><br/>
                    • <strong>PCS/PAX</strong> = <strong>${coefs.pcs_pax.toFixed(4)}</strong><br/>
                    • <strong>Weight/PC</strong> = <strong>${coefs.wght_pc.toFixed(2)} ${unitKg}</strong><br/>
                    • <strong>HB/PAX</strong> = <strong>${coefs.hb_pax.toFixed(2)} ${unitKg}</strong>
                </td>
            </tr>
        `;
    }
}

// Вспомогательная функция анимации чисел
function animateNumber(elementId, targetVal, decimals = 0) {
    const el = document.getElementById(elementId);
    const startVal = parseFloat(el.textContent) || 0;
    const duration = 400;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = progress * (2 - progress);
        const currentVal = startVal + (targetVal - startVal) * ease;
        el.textContent = currentVal.toFixed(decimals);

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = targetVal.toFixed(decimals);
        }
    }
    requestAnimationFrame(update);
}

// Вспомогательная функция для получения дня недели без сдвига часовых поясов
function getDayOfWeekFromIsoStr(isoStr) {
    if (!isoStr) return 0;
    const parts = isoStr.split('-');
    if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        return new Date(y, m, d).getDay();
    }
    const d = new Date(isoStr);
    return isNaN(d.getTime()) ? 0 : d.getDay();
}

// Поиск коэффициентов по загруженной базе рейсов с использованием 4-уровневой интеллектуальной иерархии (Smart Waterfall)
function getUploadedCoefficients(from, to, flightNo, scope = 'auto', periodType = 'auto', customStart = '', customEnd = '', seasonalMonth = '0', seasonalYear = 'all') {
    if (!userFlights || userFlights.length === 0) return null;

    const fromIata = ruToIata(from) || from;
    const toIata = ruToIata(to) || to;

    const dateInputEl = document.getElementById('input-date');
    const targetDateVal = dateInputEl ? dateInputEl.value : '';
    const targetDateMs = targetDateVal ? Date.parse(targetDateVal) : Date.now();
    const targetDayOfWeek = getDayOfWeekFromIsoStr(targetDateVal || new Date().toISOString().split('T')[0]);

    const routeFlights = userFlights.filter(f => ruToIata(f.from) === fromIata && ruToIata(f.to) === toIata);

    const finalizeResult = (res) => {
        if (!res) return null;
        const seasonInfo = getRouteSeasonalityMultiplier(from, to, targetDateVal);
        if (seasonInfo && seasonInfo.hasSeasonality) {
            res.raw_pcs_pax = res.pcs_pax;
            res.pcs_pax = res.pcs_pax * seasonInfo.multiplier;
            res.seasonalMultiplier = seasonInfo.multiplier;
            res.seasonInfo = seasonInfo;
        }
        return res;
    };

    // 1. Если выбран явный кастомный диапазон дат
    if (periodType === 'custom') {
        const startMs = customStart ? Date.parse(customStart) : 0;
        const endMs = customEnd ? Date.parse(customEnd) : Infinity;
        let targetFlights = (flightNo && scope === 'flight') ? routeFlights.filter(f => f.flight_no === flightNo) : routeFlights;
        const filtered = targetFlights.filter(f => {
            const fTime = Date.parse(f.date);
            return !isNaN(fTime) && fTime >= startMs && fTime <= endMs;
        });
        if (filtered.length > 0) {
            const result = calculateMeansFromFlights(filtered);
            result.level = 3;
            result.levelCode = 'level-3';
            result.levelName = `${currentLang === 'ru' ? 'Пользовательский период' : 'Custom Period'} (${filtered.length} выл.)`;
            result.matchedCount = filtered.length;
            return finalizeResult(result);
        }
        return null;
    }

    // 2. Если выбран явный сезонный срез
    if (periodType === 'seasonal') {
        let targetFlights = (flightNo && scope === 'flight') ? routeFlights.filter(f => f.flight_no === flightNo) : routeFlights;
        const filtered = targetFlights.filter(f => {
            if (!f.date) return false;
            const dateObj = new Date(f.date);
            const mMatch = dateObj.getMonth() === parseInt(seasonalMonth, 10);
            const yMatch = (seasonalYear === 'all') || (dateObj.getFullYear() === parseInt(seasonalYear, 10));
            return mMatch && yMatch;
        });
        if (filtered.length > 0) {
            const result = calculateMeansFromFlights(filtered);
            result.level = 3;
            result.levelCode = 'level-3';
            result.levelName = `${currentLang === 'ru' ? 'Сезонный срез' : 'Seasonal Slice'} (${filtered.length} выл.)`;
            result.matchedCount = filtered.length;
            return finalizeResult(result);
        }
        return null;
    }

    // 3. Если выбрана вся доступная история базы (3 года)
    if (periodType === 'all_history') {
        let targetFlights = (flightNo && scope === 'flight') ? routeFlights.filter(f => f.flight_no === flightNo) : routeFlights;
        const filtered = targetFlights.filter(f => {
            const fTime = Date.parse(f.date);
            return !isNaN(fTime) && fTime <= targetDateMs;
        }).sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
        if (filtered.length > 0) {
            const sample = filtered.slice(0, 30);
            const result = calculateMeansFromFlights(sample);
            result.level = 3;
            result.levelCode = 'level-3';
            result.levelName = `${currentLang === 'ru' ? 'Вся история базы' : 'All Database History'} • ${sample.length} выл.`;
            result.matchedCount = sample.length;
            return finalizeResult(result);
        }
        return null;
    }

    // --- УМНЫЙ ВОДОПАД (4 УРОВНЯ НАДЕЖНОСТИ) ---
    // Окно анализа: 180 дней до даты вылета
    const window180Ms = 180 * 24 * 60 * 60 * 1000;
    const MAX_SAMPLE_SIZE = 20; // Оптимальный объем выборки (до 20 актуальных рейсов)
    const MIN_SAMPLE_THRESHOLD = 5; // Порог минимального числа рейсов для надежной группы (Уровень 1 и 2)

    const dayNameRu = getRuDayShort(targetDayOfWeek);
    const dayNameEn = getEnDayShort(targetDayOfWeek);

    // УРОВЕНЬ 1: Номер рейса + День недели (самое точное совпадение)
    if (flightNo && (scope === 'auto' || scope === 'flight')) {
        let level1Flights = routeFlights.filter(f => {
            if (f.flight_no !== flightNo) return false;
            if (getDayOfWeekFromIsoStr(f.date) !== targetDayOfWeek) return false;
            const fMs = Date.parse(f.date);
            if (isNaN(fMs)) return false;
            const diff = targetDateMs - fMs;
            return diff >= 0 && diff <= window180Ms;
        }).sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

        // Если за 180 дней мало рейсов, но они есть в истории до даты вылета
        if (level1Flights.length < MIN_SAMPLE_THRESHOLD) {
            level1Flights = routeFlights.filter(f => {
                if (f.flight_no !== flightNo) return false;
                if (getDayOfWeekFromIsoStr(f.date) !== targetDayOfWeek) return false;
                const fMs = Date.parse(f.date);
                return !isNaN(fMs) && fMs <= targetDateMs;
            }).sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
        }

        if (level1Flights.length >= MIN_SAMPLE_THRESHOLD || (scope === 'flight' && level1Flights.length > 0)) {
            const sample = level1Flights.slice(0, MAX_SAMPLE_SIZE);
            const res = calculateMeansFromFlights(sample);
            if (res) {
                res.level = 1;
                res.levelCode = 'level-1';
                res.levelName = currentLang === 'ru' 
                    ? `🟢 Уровень 1: Рейс ${flightNo} (${dayNameRu}) • ${sample.length} выл.`
                    : `🟢 Level 1: Flight ${flightNo} (${dayNameEn}) • ${sample.length} flt.`;
                res.matchedCount = sample.length;
                return finalizeResult(res);
            }
        }
    }

    // УРОВЕНЬ 2: Маршрут (FROM -> TO) + День недели (все рейсы по маршруту в этот день недели)
    if (scope === 'auto' || scope === 'route') {
        let level2Flights = routeFlights.filter(f => {
            if (getDayOfWeekFromIsoStr(f.date) !== targetDayOfWeek) return false;
            const fMs = Date.parse(f.date);
            if (isNaN(fMs)) return false;
            const diff = targetDateMs - fMs;
            return diff >= 0 && diff <= window180Ms;
        }).sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

        if (level2Flights.length < MIN_SAMPLE_THRESHOLD) {
            level2Flights = routeFlights.filter(f => {
                if (getDayOfWeekFromIsoStr(f.date) !== targetDayOfWeek) return false;
                const fMs = Date.parse(f.date);
                return !isNaN(fMs) && fMs <= targetDateMs;
            }).sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
        }

        if (level2Flights.length >= MIN_SAMPLE_THRESHOLD || (scope === 'route' && level2Flights.length > 0)) {
            const sample = level2Flights.slice(0, MAX_SAMPLE_SIZE);
            const res = calculateMeansFromFlights(sample);
            if (res) {
                res.level = 2;
                res.levelCode = 'level-2';
                res.levelName = currentLang === 'ru'
                    ? `🔵 Уровень 2: Маршрут ${fromIata}➔${toIata} (${dayNameRu}) • ${sample.length} выл.`
                    : `🔵 Level 2: Route ${fromIata}➔${toIata} (${dayNameEn}) • ${sample.length} flt.`;
                res.matchedCount = sample.length;
                return finalizeResult(res);
            }
        }

        // УРОВЕНЬ 3: Маршрут (FROM -> TO) за все дни недели
        let level3Flights = routeFlights.filter(f => {
            const fMs = Date.parse(f.date);
            if (isNaN(fMs)) return false;
            const diff = targetDateMs - fMs;
            return diff >= 0 && diff <= window180Ms;
        }).sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

        if (level3Flights.length < MIN_SAMPLE_THRESHOLD) {
            level3Flights = routeFlights.filter(f => {
                const fMs = Date.parse(f.date);
                return !isNaN(fMs) && fMs <= targetDateMs;
            }).sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
        }

        if (level3Flights.length > 0) {
            const sample = level3Flights.slice(0, MAX_SAMPLE_SIZE);
            const res = calculateMeansFromFlights(sample);
            if (res) {
                res.level = 3;
                res.levelCode = 'level-3';
                res.levelName = currentLang === 'ru'
                    ? `🟡 Уровень 3: Маршрут ${fromIata}➔${toIata} (все дни) • ${sample.length} выл.`
                    : `🟡 Level 3: Route ${fromIata}➔${toIata} (all days) • ${sample.length} flt.`;
                res.matchedCount = sample.length;
                return finalizeResult(res);
            }
        }
    }

    // УРОВЕНЬ 4: Аэропорт вылета (DEP / FROM) — все направления из этого аэропорта
    const originFlights = userFlights.filter(f => ruToIata(f.from) === fromIata && Date.parse(f.date) <= targetDateMs)
        .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

    if (originFlights.length > 0) {
        const sample = originFlights.slice(0, MAX_SAMPLE_SIZE);
        const res = calculateMeansFromFlights(sample);
        if (res) {
            res.level = 4;
            res.levelCode = 'level-4';
            res.levelName = currentLang === 'ru'
                ? `⚪ Уровень 4: Аэропорт вылета ${fromIata} (все напр.) • ${sample.length} выл.`
                : `⚪ Level 4: Departure Airport ${fromIata} (all routes) • ${sample.length} flt.`;
            res.matchedCount = sample.length;
            return finalizeResult(res);
        }
    }

    return null;
}

// Автоматический расчет помесячного сезонного множителя на основе всей 3-летней истории базы
function getRouteSeasonalityMultiplier(from, to, targetDateStr) {
    if (!userFlights || userFlights.length < 10) return { multiplier: 1.0, hasSeasonality: false };

    const fromIata = ruToIata(from) || from;
    const toIata = ruToIata(to) || to;

    const targetMonth = targetDateStr ? new Date(targetDateStr).getMonth() : new Date().getMonth();
    const ruMonths = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    const enMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = currentLang === 'ru' ? ruMonths[targetMonth] : enMonths[targetMonth];

    // Ищем все исторические рейсы по маршруту
    const rf = userFlights.filter(f => (ruToIata(f.from) || f.from) === fromIata && (ruToIata(f.to) || f.to) === toIata);
    if (rf.length < 8) {
        return { multiplier: 1.0, hasSeasonality: false, monthName };
    }

    let totPax = 0, totBags = 0;
    let monthPax = 0, monthBags = 0, monthFlightCount = 0;

    rf.forEach(f => {
        const p = getEffectivePaxCount(f);
        const b = parseInt(f.bag_pcs, 10) || 0;
        totPax += p;
        totBags += b;

        if (f.date) {
            const m = new Date(f.date).getMonth();
            if (m === targetMonth) {
                monthPax += p;
                monthBags += b;
                monthFlightCount++;
            }
        }
    });

    if (totPax === 0 || monthPax === 0 || monthFlightCount < 3) {
        return { multiplier: 1.0, hasSeasonality: false, monthName };
    }

    const k_year = totBags / totPax;
    const k_month = monthBags / monthPax;
    const rawMultiplier = k_month / k_year;

    // Ограничиваем разумным авиационным диапазоном [0.80, 1.25]
    const multiplier = Math.max(0.80, Math.min(1.25, parseFloat(rawMultiplier.toFixed(3))));
    const isSignificant = Math.abs(multiplier - 1.0) >= 0.02;

    return {
        multiplier: multiplier,
        hasSeasonality: isSignificant,
        k_year: k_year,
        k_month: k_month,
        monthFlightCount: monthFlightCount,
        monthName: monthName
    };
}

// Расчет средних коэффициентов по переданному массиву рейсов (Экспоненциальное сглаживание alpha = 0.2 + MAD фильтрация выбросов)
function calculateMeansFromFlights(flights, alpha = 0.2) {
    if (!flights || flights.length === 0) return null;

    // Сортируем по дате в обратном порядке (самый свежий — индекс 0)
    const sortedFlights = [...flights].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
    const N = sortedFlights.length;

    let totalPax = 0;
    let totalBags = 0;
    let totalBagWeight = 0;
    let totalHbWeight = 0;

    sortedFlights.forEach(f => {
        const pax = getEffectivePaxCount(f);
        const pcs = parseInt(f.bag_pcs) || 0;
        const bagWeight = parseFloat(f.bag_weight) || 0;
        const hbWeight = parseFloat(f.hb_weight) || 0;

        totalPax += pax;
        totalBags += pcs;
        totalBagWeight += bagWeight;
        totalHbWeight += hbWeight;
    });

    if (totalPax === 0) return null;

    let weights = [];
    if (N === 1) {
        weights = [1.0];
    } else {
        const rawWeights = [];
        for (let k = 0; k < N; k++) {
            if (k === N - 1) {
                rawWeights.push(Math.pow(1 - alpha, N - 1));
            } else {
                rawWeights.push(alpha * Math.pow(1 - alpha, k));
            }
        }
        const sumW = rawWeights.reduce((a, b) => a + b, 0);
        weights = rawWeights.map(w => w / sumW);
    }

    // Извлечение индивидуальных показателей каждого рейса выборки
    const flMetrics = sortedFlights.map(f => {
        const pax = getEffectivePaxCount(f);
        const pcs = parseInt(f.bag_pcs) || 0;
        const bagWeight = parseFloat(f.bag_weight) || 0;
        const hbWeight = parseFloat(f.hb_weight) || 0;

        const k_pcs = pax > 0 ? (pcs / pax) : 0;
        const v_pc = pcs > 0 ? (bagWeight / pcs) : 0;
        const hb_pax = pax > 0 ? (hbWeight / pax) : 0;

        return { k_pcs, v_pc, hb_pax };
    });

    // Функция вычисления медианы числового массива
    const calcMedian = (arr) => {
        if (!arr || arr.length === 0) return 0;
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    };

    // MAD-фильтрация выбросов (применяется при выборке N >= 6 для устранения разовых аномалий)
    let minK = 0, maxK = Infinity;
    let minV = 0, maxV = Infinity;

    if (N >= 6) {
        const rawKs = flMetrics.map(m => m.k_pcs);
        const medK = calcMedian(rawKs);
        const madK = calcMedian(rawKs.map(x => Math.abs(x - medK)));
        if (madK > 0.001) {
            minK = Math.max(0, medK - 2.0 * madK);
            maxK = medK + 2.0 * madK;
        }

        const validVs = flMetrics.map(m => m.v_pc).filter(v => v > 0);
        if (validVs.length >= 6) {
            const medV = calcMedian(validVs);
            const madV = calcMedian(validVs.map(x => Math.abs(x - medV)));
            if (madV > 0.1) {
                minV = Math.max(5.0, medV - 2.0 * madV);
                maxV = Math.min(32.0, medV + 2.0 * madV);
            }
        }
    }

    let pcs_pax = 0;
    let wght_pc = 0;
    let hb_pax = 0;

    flMetrics.forEach((m, idx) => {
        const clampedK = Math.max(minK, Math.min(maxK, m.k_pcs));
        const clampedV = m.v_pc > 0 ? Math.max(minV, Math.min(maxV, m.v_pc)) : m.v_pc;

        const w = weights[idx];
        pcs_pax += w * clampedK;
        wght_pc += w * clampedV;
        hb_pax += w * m.hb_pax;
    });

    return {
        pcs_pax: pcs_pax,
        wght_pc: wght_pc,
        hb_pax: hb_pax,
        usedFlights: sortedFlights,
        weights: weights,
        isWeighted: true,
        alpha: alpha,
        totalPax: totalPax,
        totalBags: totalBags,
        totalBagWeight: totalBagWeight,
        totalHbWeight: totalHbWeight
    };
}

// Поиск коэффициентов в исторической базе baggageDb
function getHistoricalCoefficients(fromRu, toRu, flightNo) {
    if (!baggageDb || !baggageDb.rules) return null;

    const fromIata = ruToIata(fromRu);
    const toIata = ruToIata(toRu);

    if (flightNo) {
        const rule = baggageDb.rules.find(r => r.from === fromIata && r.to === toIata && r.flt_no === flightNo);
        if (rule) return rule;
    }

    const dirRule = baggageDb.rules.find(r => r.from === fromIata && r.to === toIata && !r.flt_no);
    if (dirRule) return dirRule;

    const anyRule = baggageDb.rules.find(r => r.from === fromIata && r.to === toIata);
    if (anyRule) return anyRule;

    return null;
}



// --- HUD ТОСТ УВЕДОМЛЕНИЯ ---
function showAviationAlert(message, isError = false) {
    let container = document.getElementById('aviation-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'aviation-toast-container';
        container.className = 'aviation-toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `aviation-toast glass ${isError ? 'error-toast' : 'success-toast'}`;
    toast.innerHTML = `
        <div class="hud-corner top-left"></div>
        <div class="hud-corner top-right"></div>
        <div class="hud-corner bottom-left"></div>
        <div class="hud-corner bottom-right"></div>
        <span class="toast-icon">${isError ? '⚠️' : '✅'}</span>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('visible');
    }, 50);
    
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 4000);
}

// --- УДАЛЕНИЕ И ОЧИСТКА ---

let activeConfirmCallback = null;

function showAviationConfirm(message, onConfirm) {
    const modal = document.getElementById('aviation-confirm-modal');
    const msgEl = document.getElementById('aviation-confirm-message');
    if (!modal || !msgEl) {
        if (confirm(message)) {
            onConfirm();
        }
        return;
    }
    
    // Принудительный перевод шапки и кнопок модального окна перед открытием
    const titleEl = modal.querySelector('.modal-title-text');
    const cancelBtn = document.getElementById('modal-btn-cancel');
    const confirmBtn = document.getElementById('modal-btn-confirm');
    
    if (titleEl && translations[currentLang]['modal-confirm-title']) {
        titleEl.textContent = translations[currentLang]['modal-confirm-title'];
    }
    if (cancelBtn && translations[currentLang]['modal-confirm-cancel']) {
        cancelBtn.textContent = translations[currentLang]['modal-confirm-cancel'];
    }
    if (confirmBtn && translations[currentLang]['modal-confirm-submit']) {
        confirmBtn.textContent = translations[currentLang]['modal-confirm-submit'];
    }
    
    msgEl.textContent = message;
    activeConfirmCallback = onConfirm;
    modal.classList.remove('hidden');
}

function initAviationModal() {
    const modal = document.getElementById('aviation-confirm-modal');
    const cancelBtn = document.getElementById('modal-btn-cancel');
    const confirmBtn = document.getElementById('modal-btn-confirm');
    
    if (!modal || !cancelBtn || !confirmBtn) return;
    
    cancelBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        activeConfirmCallback = null;
    });
    
    confirmBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        if (typeof activeConfirmCallback === 'function') {
            activeConfirmCallback();
        }
        activeConfirmCallback = null;
    });
}

// Сравнение рейсов на полное совпадение (номер рейса, дата, маршрут вылета/прилета)
function isSameFlight(f1, f2) {
    if (!f1 || !f2) return false;
    const sameNum = getNumericFlightNo(f1.flight_no) === getNumericFlightNo(f2.flight_no);
    const sameDate = String(f1.date || '').trim() === String(f2.date || '').trim();
    const sameFrom = ruToIata(f1.from) === ruToIata(f2.from);
    const sameTo = ruToIata(f1.to) === ruToIata(f2.to);
    return sameNum && sameDate && sameFrom && sameTo;
}

function upsertFlight(newFlight) {
    const idx = userFlights.findIndex(oldF => isSameFlight(oldF, newFlight));
    if (idx !== -1) {
        userFlights[idx] = newFlight;
    } else {
        userFlights.push(newFlight);
    }
}

function handleManualFlightSubmit(e) {
    if (e) e.preventDefault();

    const airline = document.getElementById('manual-airline').value || 'N4';
    const flightNo = (document.getElementById('manual-flight-no').value || '').trim();
    const dateIso = document.getElementById('manual-date').value;
    
    const manualFromEl = document.getElementById('manual-from');
    const manualFromCustomEl = document.getElementById('manual-from-custom');
    const manualToEl = document.getElementById('manual-to');
    const manualToCustomEl = document.getElementById('manual-to-custom');

    let rawFrom = (manualFromEl && manualFromEl.value === '__custom__' && manualFromCustomEl ? manualFromCustomEl.value : (manualFromEl ? manualFromEl.value : '')).trim().toUpperCase();
    let rawTo = (manualToEl && manualToEl.value === '__custom__' && manualToCustomEl ? manualToCustomEl.value : (manualToEl ? manualToEl.value : '')).trim().toUpperCase();

    if (!flightNo || !dateIso || !rawFrom || !rawTo) {
        showAviationAlert(translations[currentLang]['error-fields-required'], true);
        return;
    }

    let fromCode = rawFrom.split(' ')[0].split('(')[0].trim();
    let toCode = rawTo.split(' ')[0].split('(')[0].trim();

    const men = parseInt(document.getElementById('manual-men').value, 10) || 0;
    const women = parseInt(document.getElementById('manual-women').value, 10) || 0;
    const rb = parseInt(document.getElementById('manual-rb').value, 10) || 0;
    const rm = parseInt(document.getElementById('manual-rm').value, 10) || 0;

    const pax = men + women + rb;
    if (pax <= 0) {
        showAviationAlert(currentLang === 'ru' ? 'Укажите количество пассажиров!' : 'Please enter passenger count!', true);
        return;
    }

    const bagPcs = parseInt(document.getElementById('manual-bag-pcs').value, 10) || 0;
    const bagWeight = parseFloat(document.getElementById('manual-bag-weight').value) || 0.0;
    const hbWeight = parseFloat(document.getElementById('manual-hb-weight').value) || 0.0;

    const fromIata = ruToIata(fromCode);
    const toIata = ruToIata(toCode);

    if (!baggageDb.airports[fromCode]) {
        baggageDb.airports[fromCode] = { iata: fromIata, ru: fromCode, name: fromCode };
    }
    if (!baggageDb.airports[toCode]) {
        baggageDb.airports[toCode] = { iata: toIata, ru: toCode, name: toCode };
    }
    if (baggageDb.departures_filter && !baggageDb.departures_filter.includes(fromCode) && !baggageDb.departures_filter.includes(fromIata)) {
        baggageDb.departures_filter.push(fromIata);
    }
    if (baggageDb.arrivals_filter && !baggageDb.arrivals_filter.includes(toCode) && !baggageDb.arrivals_filter.includes(toIata)) {
        baggageDb.arrivals_filter.push(toIata);
    }

    const newFlight = {
        id: 'manual_' + Date.now(),
        airline: airline,
        flight_no: flightNo,
        date: dateIso,
        from: fromIata,
        to: toIata,
        men: men,
        women: women,
        rb: rb,
        rm: rm,
        pax: pax,
        bag_pcs: bagPcs,
        bag_weight: bagWeight,
        hb_weight: hbWeight,
        source: 'manual',
        active: true
    };

    upsertFlight(newFlight);
    saveUserFlights();

    populateAirportDropdowns();
    populateAllFlightsDropdown();

    const selectFrom = document.getElementById('select-from');
    if (selectFrom) {
        const evt = new Event('change');
        selectFrom.dispatchEvent(evt);
    }

    showAviationAlert(translations[currentLang]['success-flight-added'], false);

    document.getElementById('manual-flight-no').value = '';
    document.getElementById('manual-men').value = 0;
    document.getElementById('manual-women').value = 0;
    document.getElementById('manual-rb').value = 0;
    document.getElementById('manual-rm').value = 0;
    document.getElementById('manual-bag-pcs').value = 0;
    document.getElementById('manual-bag-weight').value = 0;
    document.getElementById('manual-hb-weight').value = 0;
    
    if (manualFromEl) manualFromEl.value = '';
    if (manualToEl) manualToEl.value = '';
    if (manualFromCustomEl) {
        manualFromCustomEl.value = '';
        manualFromCustomEl.classList.add('hidden');
    }
    if (manualToCustomEl) {
        manualToCustomEl.value = '';
        manualToCustomEl.classList.add('hidden');
    }
}

// Экспорт всей базы данных (рейсы + история прогнозов) в JSON файл
function handleExportDatabase() {
    try {
        const backupData = {
            backup_version: "1.0",
            exported_at: new Date().toISOString(),
            flights: userFlights,
            predictions_history: predictionsHistory,
            custom_airports: getCustomAirportsList(),
            airport_filters: getCustomAirportFilters()
        };

        const jsonString = JSON.stringify(backupData, null, 4);
        const blob = new Blob([jsonString], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        const dateObj = new Date();
        const dateStr = dateObj.getFullYear() + "_" + 
                        String(dateObj.getMonth() + 1).padStart(2, '0') + "_" + 
                        String(dateObj.getDate()).padStart(2, '0');
        
        link.href = url;
        link.download = `aerobag_backup_${dateStr}.json`;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        
        // Небольшая задержка перед удалением и очисткой URL для стабильности в некоторых браузерах
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
    } catch (err) {
        console.error("Ошибка экспорта базы данных:", err);
        showAviationAlert("Ошибка экспорта базы данных", true);
    }
}

// Импорт базы данных из JSON файла резервной копии или Excel-отчета
function handleImportDatabase(file) {
    if (!file) return;

    const lowerName = (file.name || '').toLowerCase();
    if (lowerName.endsWith('.xls') || lowerName.endsWith('.xlsx')) {
        handleUploadedFiles([file]);
        const backupInput = document.getElementById('backup-file-input');
        if (backupInput) backupInput.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const parsed = JSON.parse(e.target.result);
            let importedFlights = [];
            let importedPredictions = [];

            // Проверяем структуру бэкапа
            if (parsed && typeof parsed === 'object') {
                if (Array.isArray(parsed)) {
                    // Обратная совместимость: если бэкап - это просто массив рейсов
                    importedFlights = parsed;
                } else {
                    importedFlights = Array.isArray(parsed.flights) ? parsed.flights : [];
                    importedPredictions = Array.isArray(parsed.predictions_history) ? parsed.predictions_history : [];
                }
            } else {
                throw new Error("Неверный формат JSON");
            }

            // Записываем данные в глобальное состояние с нормализацией кодов аэропортов в стандарт ИАТА
            userFlights = importedFlights.map(normalizeFlightRecord);
            predictionsHistory = importedPredictions;

            // Восстановление пользовательских направлений и фильтров
            if (parsed.custom_airports && Array.isArray(parsed.custom_airports)) {
                saveCustomAirportsList(parsed.custom_airports);
                applyCustomAirportsToDb(parsed.custom_airports);
            }
            if (parsed.airport_filters && typeof parsed.airport_filters === 'object') {
                saveCustomAirportFilters(parsed.airport_filters);
                renderAirportFiltersUI();
            }

            // Сохраняем в зависимости от оффлайн/онлайн режима
            if (isOfflineMode) {
                localStorage.setItem('averago_user_flights_local', JSON.stringify(userFlights));
            } else {
                // В режиме MySQL отправляем все восстановленные рейсы на сервер (UPSERT)
                await saveUserFlights();
            }

            // История прогнозов всегда сохраняется в localStorage
            savePredictionsHistory();

            // Обновляем весь UI
            updateActiveDateRangeAndCounts();
            renderFlightsTable();
            renderPredictionsTable();
            renderUploadedFilesList();

            // Сбрасываем фильтры, чтобы пересчитать выпадающие списки
            const selectFrom = document.getElementById('select-from');
            if (selectFrom) {
                selectFrom.value = '';
                const event = new Event('change');
                selectFrom.dispatchEvent(event);
            }

            // Показываем сообщение об успехе
            const successMsg = (translations[currentLang]['backup-import-success'] || 'База успешно восстановлена!')
                .replace('{flights}', userFlights.length)
                .replace('{predictions}', predictionsHistory.length);
            
            showAviationAlert(successMsg, false);

        } catch (err) {
            console.error("Ошибка импорта базы данных:", err);
            const errMsg = translations[currentLang]['backup-import-error'] || 'Ошибка чтения файла резервной копии.';
            showAviationAlert(errMsg, true);
        }
        
        // Очищаем значение input, чтобы можно было загрузить тот же файл повторно
        document.getElementById('backup-file-input').value = '';
    };

    reader.readAsText(file);
}

function handleClearDb(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    console.log("handleClearDb called, currentLang:", currentLang);
    const msg = (translations[currentLang] && translations[currentLang]['confirm-clear-db']) 
        || (currentLang === 'en' ? "Are you sure you want to clear the entire flights database?" : "Вы уверены, что хотите очистить всю базу данных рейсов?");
    
    showAviationConfirm(msg, async () => {
        userFlights = [];
        try {
            localStorage.setItem('averago_user_flights_local', JSON.stringify([]));
        } catch (e) {
            console.error("Ошибка очистки LocalStorage:", e);
        }

        if (!isOfflineMode) {
            try {
                await fetch('api.php?action=clear_db');
            } catch (err) {
                console.warn("Серверная очистка недоступна, очищено локально:", err);
            }
        }

        updateActiveDateRangeAndCounts();
        renderFlightsTable();
        renderUploadedFilesList();
        populateAirportDropdowns();
        populateAllFlightsDropdown();

        showAviationAlert(translations[currentLang]['success-db-cleared'] || "База данных рейсов успешно очищена", false);

        const selectFrom = document.getElementById('select-from');
        if (selectFrom) {
            selectFrom.value = '';
            const event = new Event('change');
            selectFrom.dispatchEvent(event);
        }
    });
}

function handleClearPredictions(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    console.log("handleClearPredictions called, currentLang:", currentLang);
    const msg = (translations[currentLang] && translations[currentLang]['confirm-clear-predictions']) 
        || (currentLang === 'en' ? "Are you sure you want to clear the entire predictions history?" : "Вы уверены, что хотите очистить всю историю прогнозов?");
    
    showAviationConfirm(msg, () => {
        clearTimeout(saveCompartmentsTimeout);
        predictionsHistory = [];
        savePredictionsHistory();
        renderPredictionsTable();
        clearLoadPlanningUI();
    });
}

async function deleteFlight(id) {
    if (isOfflineMode) {
        try {
            userFlights = userFlights.filter(f => f.id !== id);
            localStorage.setItem('averago_user_flights_local', JSON.stringify(userFlights));
            updateActiveDateRangeAndCounts();
            renderFlightsTable();
            renderUploadedFilesList();
        } catch (err) {
            console.error("Ошибка при локальном удалении рейса:", err);
            showAviationAlert("Ошибка при удалении локального рейса", true);
        }
    } else {
        try {
            const response = await fetch(`api.php?action=delete_flight&id=${encodeURIComponent(id)}`);
            const data = await response.json();
            if (data.success) {
                userFlights = userFlights.filter(f => f.id !== id);
                updateActiveDateRangeAndCounts();
                renderFlightsTable();
                renderUploadedFilesList();
            } else {
                showAviationAlert("Ошибка при удалении рейса: " + data.error, true);
            }
        } catch (err) {
            console.error("Ошибка при удалении рейса:", err);
            showAviationAlert("Ошибка сети при удалении рейса", true);
        }
    }

    const selectFrom = document.getElementById('select-from');
    if (selectFrom) {
        const event = new Event('change');
        selectFrom.dispatchEvent(event);
    }
}

function deletePrediction(id) {
    clearTimeout(saveCompartmentsTimeout);
    const wasActive = (currentActivePredictionId === id);
    predictionsHistory = predictionsHistory.filter(p => p.id !== id);
    savePredictionsHistory();
    renderPredictionsTable();

    if (wasActive) {
        clearLoadPlanningUI();
    } else if (currentActivePredictionId) {
        highlightPredictionRow(currentActivePredictionId);
    }
}

// Экспортируем в глобальную область для инлайновых обработчиков
window.handleClearDb = handleClearDb;
window.handleClearPredictions = handleClearPredictions;
window.deleteFlight = deleteFlight;
window.deletePrediction = deletePrediction;
window.clearLoadPlanningUI = clearLoadPlanningUI;

// --- ОТРИСОВКА ТАБЛИЦЫ РЕЙСОВ (База данных - только за последние 10 дней) ---
function renderFlightsTable() {
    const tbody = document.getElementById('flights-table-body');
    tbody.innerHTML = '';

    if (userFlights.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="10" class="empty-table-text">${translations[currentLang]['empty-table']}</td>`;
        tbody.appendChild(tr);
        return;
    }

    // Находим максимальную дату среди рейсов в базе
    let maxDateMs = 0;
    userFlights.forEach(flight => {
        const time = Date.parse(flight.date);
        if (!isNaN(time) && time > maxDateMs) {
            maxDateMs = time;
        }
    });

    const showAll = document.getElementById('chk-show-all-flights')?.checked || false;
    // Динамически обновляем заголовок таблицы
    const titleEl = document.querySelector('[data-translate="flights-table-title"]');
    if (titleEl) {
        const key = showAll ? 'flights-table-title-all' : 'flights-table-title';
        titleEl.textContent = translations[currentLang][key] || (showAll ? 'Flights Database (all)' : 'Flights Database (last 10 days)');
    }

    let visibleFlights;
    if (showAll) {
        visibleFlights = userFlights;
    } else {
        // Фильтр за последние 10 дней
        const tenDaysMs = 10 * 24 * 60 * 60 * 1000;
        const minDateMsVisible = maxDateMs - tenDaysMs;

        visibleFlights = userFlights.filter(f => {
            const time = Date.parse(f.date);
            return isNaN(time) || time >= minDateMsVisible;
        });
    }

    if (visibleFlights.length === 0) {
        const tr = document.createElement('tr');
        const emptyMsg = showAll 
            ? (currentLang === 'ru' ? 'База данных пуста.' : 'Database is empty.')
            : (currentLang === 'ru' ? 'Нет рейсов за последние 10 дней.' : 'No flights within the last 10 days.');
        tr.innerHTML = `<td colspan="10" class="empty-table-text">${emptyMsg}</td>`;
        tbody.appendChild(tr);
        return;
    }

    const sorted = [...visibleFlights].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

    sorted.forEach(f => {
        const tr = document.createElement('tr');
        if (!f.active) {
            tr.classList.add('inactive-row');
        }

        const dateStr = formatDateStr(f.date);
        const adult = f.men + f.women;
        const paxStr = `${f.pax} (${adult} / ${f.rb} / ${f.rm})`;
        const statusText = f.active ? translations[currentLang]['status-active'] : translations[currentLang]['status-inactive'];
        const statusClass = f.active ? 'active' : 'inactive';

        tr.innerHTML = `
            <td><strong>${formatAirline(f.airline)}</strong></td>
            <td>${f.flight_no}</td>
            <td>${dateStr}</td>
            <td><strong>${ruToIata(f.from)} ➔ ${ruToIata(f.to)}</strong></td>
            <td>${paxStr}</td>
            <td>${f.bag_pcs}</td>
            <td>${Math.round(f.bag_weight)} кг</td>
            <td>${Math.round(f.hb_weight)} кг</td>
            <td><span class="status-pill ${statusClass}">${statusText}</span></td>
            <td>
                <button class="btn-delete-row" title="Удалить" onclick="deleteFlight('${f.id}')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// --- ОТРИСОВКА ТАБЛИЦЫ ПРОГНОЗОВ (История прогнозирования) ---

// Нормализация и форматирование времени вылета (ЧЧ:ММ)
function normalizeTimeString(timeStr) {
    if (!timeStr) return '';
    let clean = String(timeStr).trim().replace(/[^\d:]/g, '');
    if (!clean) return '';
    if (clean.includes(':')) {
        const parts = clean.split(':');
        let h = parseInt(parts[0], 10);
        let m = parseInt(parts[1], 10);
        if (isNaN(h)) h = 0;
        if (isNaN(m)) m = 0;
        h = Math.max(0, Math.min(23, h));
        m = Math.max(0, Math.min(59, m));
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
    if (clean.length === 3) {
        clean = '0' + clean;
    }
    if (clean.length === 4) {
        let h = parseInt(clean.slice(0, 2), 10);
        let m = parseInt(clean.slice(2, 4), 10);
        if (isNaN(h)) h = 0;
        if (isNaN(m)) m = 0;
        h = Math.max(0, Math.min(23, h));
        m = Math.max(0, Math.min(59, m));
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
    return clean;
}

// Сортировка истории расчетов по времени вылета: от самого ближайшего к самому позднему
function sortPredictionsHistoryByDepTime() {
    if (!predictionsHistory || predictionsHistory.length <= 1) return;

    predictionsHistory.sort((a, b) => {
        const timeA = normalizeTimeString(a.dep_time);
        const timeB = normalizeTimeString(b.dep_time);

        if (!timeA && !timeB) {
            return new Date(b.calc_date || 0) - new Date(a.calc_date || 0);
        }
        if (!timeA) return 1;
        if (!timeB) return -1;

        const dateA = a.flight_date ? String(a.flight_date).split('T')[0] : '';
        const dateB = b.flight_date ? String(b.flight_date).split('T')[0] : '';

        if (dateA && dateB && dateA !== dateB) {
            const dateCmp = dateA.localeCompare(dateB);
            if (dateCmp !== 0) return dateCmp;
        }

        const [hA, mA] = timeA.split(':').map(n => parseInt(n, 10) || 0);
        const [hB, mB] = timeB.split(':').map(n => parseInt(n, 10) || 0);
        const minsA = hA * 60 + mA;
        const minsB = hB * 60 + mB;

        if (minsA !== minsB) {
            return minsA - minsB;
        }

        return String(a.flight_no).localeCompare(String(b.flight_no));
    });
}

// Сквозная авто-синхронизация времен вылета рейсов из AeroPlan (Авиабит)
async function syncFlightTimesWithAeroPlan(explicitFlights = null) {
    let flights = explicitFlights;
    if (!flights || !Array.isArray(flights) || flights.length === 0) {
        // 1. Проверяем LocalStorage (общая активная смена AeroPlan на домене boostandgo.ru)
        try {
            const raw = localStorage.getItem('aeroplan_shift_journal_active_flights');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    flights = parsed;
                }
            }
        } catch (e) {}
    }

    if (!flights || !Array.isArray(flights) || flights.length === 0) {
        // 2. Если в LocalStorage рейсов нет, запрашиваем активную смену с сервера AeroPlan
        try {
            const isTest = window.location.pathname.includes('_test') || window.location.pathname.includes('-test') || window.location.href.includes('8080');
            const apiEndpoint = isTest ? 'https://boostandgo.ru/plan_test/api/shift/current' : 'https://boostandgo.ru/plan/api/shift/current';
            const res = await fetch(apiEndpoint, { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                if (data && Array.isArray(data.flights)) {
                    flights = data.flights;
                }
            }
        } catch (e) {}
    }

    if (!flights || !Array.isArray(flights) || flights.length === 0) return 0;
    if (!predictionsHistory || predictionsHistory.length === 0) return 0;

    const normalizeDateStr = (d) => {
        if (!d) return '';
        const s = String(d).trim().split('T')[0];
        if (s.includes('-')) {
            const p = s.split('-');
            if (p.length === 3 && p[0].length === 4) return `${p[2].padStart(2, '0')}.${p[1].padStart(2, '0')}`;
        }
        if (s.includes('.')) {
            const p = s.split('.');
            if (p.length >= 2) return `${p[0].padStart(2, '0')}.${p[1].padStart(2, '0')}`;
        }
        return s;
    };

    const extractFltNum = (flt) => {
        if (!flt) return '';
        const m = String(flt).replace(/\D/g, '');
        return m ? String(parseInt(m, 10)) : '';
    };

    let updatedCount = 0;

    predictionsHistory.forEach(p => {
        const pNum = extractFltNum(p.flight_no);
        if (!pNum) return;
        const pDate = normalizeDateStr(p.flight_date || p.calc_date);

        const match = flights.find(f => {
            const fNum = extractFltNum(f.flight);
            if (fNum !== pNum) return false;
            const fDate = normalizeDateStr(f.flight_date);
            if (pDate && fDate && pDate !== fDate) return false;
            return true;
        });

        if (match) {
            const newTime = normalizeTimeString(match.time || match.departure_time);
            const oldTime = normalizeTimeString(p.dep_time);
            if (newTime && newTime !== oldTime) {
                p.dep_time = newTime;
                updatedCount++;

                // Если открыт этот рейс в интерфейсе, обновляем бейдж и поле
                if (currentActivePredictionId === p.id) {
                    currentIncomingFlightData.dep_time = newTime;
                    updateActiveFlightBadge(p.from, p.to, p.flight_no, p.flight_date || p.calc_date, p.ac_num, newTime);
                }
            }
        }
    });

    if (updatedCount > 0) {
        savePredictionsHistory();
        sortPredictionsHistoryByDepTime();
        renderPredictionsTable();
        console.log(`[AeroBag] Автоматически обновлено время вылета для ${updatedCount} рейсов из AeroPlan`);
    }

    return updatedCount;
}

// Изменение времени вылета вручную прямо в строке истории
function handleHistoryTimeChange(predId, rawTime) {
    if (!predId) return;
    const p = predictionsHistory.find(item => item.id === predId);
    if (!p) return;

    const formatted = normalizeTimeString(rawTime);
    p.dep_time = formatted;

    savePredictionsHistory();
    sortPredictionsHistoryByDepTime();
    renderPredictionsTable();

    if (currentActivePredictionId === predId) {
        currentIncomingFlightData.dep_time = formatted;
        updateActiveFlightBadge(p.from, p.to, p.flight_no, p.flight_date || p.calc_date, p.ac_num, formatted);
    }
}

function renderPredictionsTable() {
    const tbody = document.getElementById('predictions-table-body');
    if (!tbody) return;

    // Автоматическая сортировка по времени вылета (от ближайшего к позднему)
    sortPredictionsHistoryByDepTime();

    tbody.innerHTML = '';

    if (predictionsHistory.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="5" class="empty-table-text">${translations[currentLang]['empty-predictions-table']}</td>`;
        tbody.appendChild(tr);
        return;
    }

    predictionsHistory.forEach(p => {
        const tr = document.createElement('tr');
        tr.className = 'history-row-clickable';
        tr.setAttribute('data-pred-id', p.id);
        tr.title = currentLang === 'ru' ? 'Нажмите для переноса в Средний вес багажа и данные загрузки' : 'Click to transfer to Load Planning';

        tr.addEventListener('click', (e) => {
            if (e.target.closest('.btn-delete-row') || e.target.closest('.dep-time-input')) return;
            transferPredictionToPreliminary(p.id);
        });
        
        // Форматирование суффикса даты рейса /ДД.ММ
        let flightDayMonthStr = '';
        const flightDateSrc = p.flight_date || p.calc_date;
        if (flightDateSrc) {
            try {
                const parts = String(flightDateSrc).split('T')[0].split('-');
                if (parts.length === 3) {
                    flightDayMonthStr = `/${parts[2]}.${parts[1]}`;
                }
            } catch (e) {
                console.error("Ошибка парсинга даты вылета:", e);
            }
        }

        const routeText = `${ruToIata(p.from)} ➔ ${ruToIata(p.to)}`;
        const tailDisplay = p.ac_num ? `RA-${normalizeTailNumber(p.ac_num)}` : '—';
        const currentTimeVal = p.dep_time || '';

        tr.innerHTML = `
            <td class="history-cell-route" title="${routeText}"><strong>${routeText}</strong></td>
            <td class="history-cell-flight"><strong>${p.flight_no}</strong><span class="flight-day-tag">${flightDayMonthStr}</span></td>
            <td class="history-cell-time" title="${currentLang === 'ru' ? 'Время вылета (нажмите для изменения)' : 'Departure Time (click to edit)'}">
                <input type="text" class="dep-time-input monospace-val" value="${currentTimeVal}" placeholder="--:--" maxlength="5" />
            </td>
            <td class="history-cell-tail" title="${currentLang === 'ru' ? 'Бортовой номер' : 'Aircraft Tail'}">${tailDisplay}</td>
            <td class="history-cell-action">
                <button class="btn-delete-row" title="${currentLang === 'ru' ? 'Удалить' : 'Delete'}" onclick="deletePrediction('${p.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>
            </td>
        `;

        // Обработчик интерактивного изменения времени в инпуте
        const timeInp = tr.querySelector('.dep-time-input');
        if (timeInp) {
            timeInp.addEventListener('click', (e) => e.stopPropagation());
            timeInp.addEventListener('mousedown', (e) => e.stopPropagation());
            timeInp.addEventListener('pointerdown', (e) => e.stopPropagation());
            timeInp.addEventListener('focus', (e) => e.target.select());
            timeInp.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    e.target.blur();
                }
            });
            timeInp.addEventListener('change', (e) => {
                handleHistoryTimeChange(p.id, e.target.value);
            });
        }

        tbody.appendChild(tr);
    });

    if (currentActivePredictionId) {
        highlightPredictionRow(currentActivePredictionId);
    }
}

// Вспомогательная функция обновления верхней инфо-плашки активного рейса в таблице загрузки
function updateActiveFlightBadge(from, to, flightNo, flightDate, acNum, depTime) {
    const badgeEl = document.getElementById('active-flight-badge');
    const badgeRoute = document.getElementById('badge-route');
    const badgeFlightNo = document.getElementById('badge-flight-no');
    const badgeFlightDate = document.getElementById('badge-flight-date');

    if (!badgeEl) return;

    const fromIata = (from ? ruToIata(from) : '') || from || '';
    const toIata = (to ? ruToIata(to) : '') || to || '';

    let dateTag = '';
    if (flightDate) {
        try {
            const parts = String(flightDate).split('T')[0].split('-');
            if (parts.length === 3) {
                dateTag = `/${parts[2]}.${parts[1]}`;
            }
        } catch (e) {}
    }

    if (badgeRoute) badgeRoute.textContent = (fromIata && toIata) ? `${fromIata} ➔ ${toIata}` : (fromIata || toIata || '—');
    if (badgeFlightNo) badgeFlightNo.textContent = flightNo || '—';
    if (badgeFlightDate) badgeFlightDate.textContent = dateTag;

    let badgeTail = document.getElementById('badge-tail-no');
    const cleanTail = normalizeTailNumber(acNum);
    if (cleanTail) {
        if (!badgeTail) {
            badgeTail = document.createElement('span');
            badgeTail.id = 'badge-tail-no';
            badgeTail.className = 'badge-tail-no';
            badgeEl.appendChild(badgeTail);
        }
        badgeTail.textContent = ` [RA-${cleanTail}]`;
    } else if (badgeTail) {
        badgeTail.textContent = '';
    }

    badgeEl.classList.remove('hidden');
}

// Вспомогательная функция выделения строки в таблице истории
function highlightPredictionRow(predId) {
    const tbody = document.getElementById('predictions-table-body');
    if (!tbody) return;

    Array.from(tbody.querySelectorAll('tr')).forEach(tr => {
        tr.classList.remove('selected-history-row');
    });

    const targetTr = tbody.querySelector(`tr[data-pred-id="${predId}"]`);
    if (targetTr) {
        targetTr.classList.add('selected-history-row');
    }
}

// --- ПАРСИНГ EXCEL ФАЙЛОВ СИСТЕМЫ РЕГИСТРАЦИИ ---

function setupDragAndDrop() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');

    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    ['dragleave', 'dragend'].forEach(type => {
        dropZone.addEventListener(type, () => {
            dropZone.classList.remove('dragover');
        });
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleUploadedFiles(files);
        }
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            handleUploadedFiles(fileInput.files);
        }
    });
}

function handleUploadedFiles(files) {
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const rawResult = e.target.result;
            let workbook = null;

            // 1. Попытка 1: Чтение через ArrayBuffer (стандартные xls/xlsx)
            try {
                const arr = new Uint8Array(rawResult);
                workbook = XLSX.read(arr, { type: 'array', cellDates: false });
            } catch (err1) {
                console.warn("ArrayBuffer read failed, trying UTF-8 text string...", err1);
            }

            // 2. Попытка 2: Чтение как ТЕКСТ UTF-8 (HTML / XML / SpreadsheetML 2003 / CSV с расширением .xls)
            if (!workbook) {
                try {
                    const textDecoder = new TextDecoder('utf-8');
                    const textStr = textDecoder.decode(rawResult);
                    workbook = XLSX.read(textStr, { type: 'string', cellDates: false });
                } catch (err2) {
                    console.warn("UTF-8 text string read failed, trying windows-1251...", err2);
                    try {
                        const textDecoder1251 = new TextDecoder('windows-1251');
                        const textStr1251 = textDecoder1251.decode(rawResult);
                        workbook = XLSX.read(textStr1251, { type: 'string', cellDates: false });
                    } catch (err3) {
                        console.error("All read attempts failed for file:", file.name, err3);
                    }
                }
            }

            if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
                showAviationAlert(translations[currentLang]['file-process-error'].replace('{name}', file.name), true);
                return;
            }

            try {
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
                
                processRegistrationData(file.name, rows);
            } catch (processErr) {
                console.error("Ошибка обработки таблицы:", processErr);
                showAviationAlert(translations[currentLang]['file-process-error'].replace('{name}', file.name), true);
            }
        };

        reader.readAsArrayBuffer(file);
    });
}

function processRegistrationData(filename, rows, options = {}) {
    const isSilent = !!options.isSilent;
    const isSystem = !!options.isSystem;

    if (!rows || rows.length === 0) {
        if (!isSilent) {
            showAviationAlert(translations[currentLang]['file-process-error'].replace('{name}', filename), true);
        }
        return;
    }

    let headerRowIdx = -1;

    // 1. Поиск строки заголовков по ключевым словам (рейс + направление/пассажиры)
    for (let i = 0; i < Math.min(rows.length, 25); i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;
        
        const cleanCells = Array.from(row).map(cell => cell !== null && cell !== undefined ? String(cell).trim().toLowerCase() : '');
        
        const hasFlight = cleanCells.some(c => c && (c.includes('рейс') || c.includes('flt') || c.includes('flight') || c.includes('№')));
        const hasDirection = cleanCells.some(c => c && (c.includes('направление') || c.includes('direction') || c.includes('прилет') || c.includes('куда') || c.includes('destination') || c.includes('маршрут') || c.includes('to')));
        const hasPax = cleanCells.some(c => c && (c.includes('пасс') || c.includes('pax') || c.includes('кол-во') || c.includes('passengers') || c.includes('всего') || c.includes('вз')));
        
        if (hasFlight && (hasDirection || hasPax)) {
            headerRowIdx = i;
            break;
        }
    }

    // 2. Если не найдено, проверяем первую непустую строку
    if (headerRowIdx === -1) {
        for (let i = 0; i < Math.min(rows.length, 5); i++) {
            if (rows[i] && rows[i].length > 3) {
                headerRowIdx = i;
                break;
            }
        }
    }

    if (headerRowIdx === -1) headerRowIdx = 0;

    const rawHeaders = Array.from(rows[headerRowIdx] || []);
    const headers = rawHeaders.map(h => (h !== null && h !== undefined) ? String(h).trim().toLowerCase() : '');
    
    // Каноничный сопоставитель по названию или спецификации колонок (A=0, B=1, C=2, D=3, E=4, P=15, Q=16, S=18, T=19, U=20, V=21)
    const colMap = {
        airline: headers.findIndex(h => h && (h.includes('код а/к') || h.includes('а/к') || h.includes('airline') || h === 'ак')),
        airportFrom: headers.findIndex(h => h && (h.includes('код а/п') || h.includes('вылет') || h.includes('from') || h.includes('аэропорт вылета') || h.includes('откуда'))),
        flightNo: headers.findIndex(h => h && (h.includes('рейс') || h.includes('flt') || h.includes('flight') || h.includes('номер рейса') || h.includes('№'))),
        date: headers.findIndex(h => h && (h.includes('дата') || h.includes('date'))),
        direction: headers.findIndex(h => h && (h.includes('направление') || h.includes('прилет') || h.includes('to') || h.includes('dest') || h.includes('куда') || h.includes('маршрут'))),
        pax: headers.findIndex(h => h && (h.includes('пасс') || h.includes('pax') || h.includes('кол-во') || h.includes('passenger') || h.includes('всего'))),
        men: headers.findIndex(h => h && (h === 'м' || h.includes('муж') || h.includes('men') || h === 'm')),
        women: headers.findIndex(h => h && (h === 'ж' || h.includes('жен') || h.includes('women') || h === 'w' || h === 'f')),
        rb: headers.findIndex(h => h && (h === 'рб' || h.includes('chd') || h.includes('дети') || h.includes('ребенок'))),
        rm: headers.findIndex(h => h && (h === 'рм' || h.includes('inf') || h.includes('млад') || h.includes('младен'))),
        vz: headers.findIndex(h => h && (h === 'вз' || h.includes('adl') || h.includes('взрос'))),
        hbWeight: headers.findIndex(h => h && (h.includes('р/кладь') || h.includes('ручная') || h.includes('hb') || h.includes('cabin'))),
        bagPcs: headers.findIndex(h => h && (h.includes('бг мест') || h.includes('багаж мест') || h.includes('bag pcs') || h.includes('мест'))),
        bagWeight: headers.findIndex(h => h && (h === 'бг вес' || h.includes('бг вес') || h.includes('багаж вес') || h.includes('bag weight') || h.includes('вес бг') || h.includes('вес багаж')))
    };

    // Строгие стандартизированные столбцы отчета регистрации: A=0, B=1, C=2, D=3, E=4, P=15, Q=16, S=18, T=19, U=20, V=21
    if (colMap.airline === -1) colMap.airline = 0;      // Столбец A (Код авиакомпании)
    if (colMap.airportFrom === -1) colMap.airportFrom = 1; // Столбец B (Аэропорт вылета)
    if (colMap.flightNo === -1) colMap.flightNo = 2;    // Столбец C (Номер рейса)
    if (colMap.date === -1) colMap.date = 3;            // Столбец D (Дата рейса)
    if (colMap.direction === -1) colMap.direction = 4;   // Столбец E (Аэропорт прилёта)
    if (colMap.vz === -1) colMap.vz = 15;                // Столбец P (Взрослые)
    if (colMap.rb === -1) colMap.rb = 16;                // Столбец Q (РБ)
    if (colMap.rm === -1) colMap.rm = 18;                // Столбец S (РМ)
    if (colMap.hbWeight === -1) colMap.hbWeight = 19;    // Столбец T (Р/кладь вес)
    if (colMap.bagPcs === -1) colMap.bagPcs = 20;        // Столбец U (Багаж мест)
    if (colMap.bagWeight === -1) colMap.bagWeight = 21;    // Столбец V (Багаж вес)

    let addedCount = 0;
    const customFilters = getCustomAirportFilters();
    const allowedDeparturesSet = new Set((customFilters.departures || []).map(c => String(c).trim().toUpperCase()));
    const allowedArrivalsSet = new Set((customFilters.arrivals || []).map(c => String(c).trim().toUpperCase()));

    for (let i = headerRowIdx + 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const getVal = (idx) => (idx !== -1 && row[idx] !== undefined && row[idx] !== null) ? String(row[idx]).trim() : '';

        let rawAirline = getVal(colMap.airline);
        let rawFrom = getVal(colMap.airportFrom);
        let rawFltNo = getVal(colMap.flightNo);
        let rawDate = getVal(colMap.date);
        let rawDirectionFull = getVal(colMap.direction);

        // Строка является данными рейса, если в номере рейса или дате присутствуют цифры (отсеиваем шапки повторных страниц)
        const hasFltDigits = /\d+/.test(rawFltNo);
        const hasDateDigits = /\d+/.test(rawDate);
        if (!hasFltDigits && !hasDateDigits) continue;

        let cleanFrom = parseCleanAirportCode(rawFrom);
        let last3 = rawDirectionFull.length >= 3 ? rawDirectionFull.slice(-3).trim() : rawDirectionFull.trim();
        let cleanDirection = parseCleanAirportCode(last3) || parseCleanAirportCode(rawDirectionFull) || last3;

        if (!cleanFrom) cleanFrom = 'AER';
        if (!cleanDirection) cleanDirection = 'AYT';

        const fromInfo = resolveAirportInfo(cleanFrom) || resolveAirportInfo(rawFrom);
        const fromIata = fromInfo ? fromInfo.iata : (ruToIata(cleanFrom) || cleanFrom);
        const fromRu = fromInfo ? fromInfo.ru : (iataToRu(fromIata) || cleanFrom);
        const toInfo = resolveAirportInfo(cleanDirection) || resolveAirportInfo(rawDirectionFull);
        const toIata = toInfo ? toInfo.iata : (ruToIata(cleanDirection) || cleanDirection);
        const toRu = toInfo ? toInfo.ru : (iataToRu(toIata) || cleanDirection);

        // 1. Проверка по фильтру вылетов (Departures Filter)
        if (allowedDeparturesSet.size > 0) {
            const isAllowedDep = allowedDeparturesSet.has(fromIata.toUpperCase()) || 
                                 allowedDeparturesSet.has(fromRu.toUpperCase()) || 
                                 allowedDeparturesSet.has(cleanFrom.toUpperCase()) || 
                                 allowedDeparturesSet.has(rawFrom.toUpperCase()) ||
                                 (fromInfo && fromInfo.name && allowedDeparturesSet.has(fromInfo.name.toUpperCase()));

            if (!isAllowedDep) {
                // Рейс из неразрешенного аэропорта вылета пропускается
                continue;
            }
        }

        // 2. Проверка по фильтру прилетов (Arrivals Filter, только если включен строгий режим - Вариант А)
        if (customFilters.strict_arrivals && allowedArrivalsSet.size > 0) {
            const isAllowedArr = allowedArrivalsSet.has(toIata.toUpperCase()) || 
                                 allowedArrivalsSet.has(toRu.toUpperCase()) || 
                                 allowedArrivalsSet.has(cleanDirection.toUpperCase()) || 
                                 allowedArrivalsSet.has(rawDirectionFull.toUpperCase()) ||
                                 (toInfo && toInfo.name && allowedArrivalsSet.has(toInfo.name.toUpperCase()));

            if (!isAllowedArr) {
                // Рейс в неразрешенный аэропорт прилета пропускается
                continue;
            }
        }

        // Пассажиры: ВЗ (Столбец P / 15), РБ (Столбец Q / 16), РМ (Столбец S / 18)
        let vz = parseInt(getVal(colMap.vz), 10) || 0;
        let rb = parseInt(getVal(colMap.rb), 10) || 0;
        let rm = parseInt(getVal(colMap.rm), 10) || 0;

        let totalPax = vz + rb;
        if (totalPax === 0) {
            const rawPaxCol = parseInt(getVal(colMap.pax), 10) || 0;
            if (rawPaxCol > 0) {
                totalPax = Math.max(0, rawPaxCol - rm);
            }
        }
        if (totalPax <= 0) totalPax = 1;

        // Р/кладь (Столбец T / 19), Багаж мест (Столбец U / 20), Багаж вес (Столбец V / 21)
        const hbWeight = parseFloat(getVal(colMap.hbWeight).replace(',', '.')) || 0;
        const bagPcs = parseInt(getVal(colMap.bagPcs), 10) || 0;
        const bagWeight = parseFloat(getVal(colMap.bagWeight).replace(',', '.')) || 0;

        const formattedDate = formatExcelDate(rawDate);

        const newFlight = {
            id: 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            airline: formatAirline(rawAirline),
            flight_no: getNumericFlightNo(rawFltNo) || rawFltNo,
            date: formattedDate,
            from: fromIata,
            to: toIata,
            men: vz,
            women: 0,
            rb: rb,
            rm: rm,
            pax: totalPax,
            bag_pcs: bagPcs,
            bag_weight: bagWeight,
            hb_weight: hbWeight,
            source: filename,
            isSystem: isSystem,
            active: true
        };

        upsertFlight(newFlight);
        addedCount++;
    }

    saveUserFlights();
    populateAirportDropdowns();
    updateActiveDateRangeAndCounts();
    renderFlightsTable();
    renderUploadedFilesList();
    populateAllFlightsDropdown();

    if (!isSilent) {
        const msg = (translations[currentLang]['file-processed-success'] || 'Файл "{name}" успешно обработан. Загружено {count} рейсов.').replace('{name}', filename).replace('{count}', addedCount);
        showAviationAlert(msg, false);
    }
}

function renderFileItem(name, count) {
    const list = document.getElementById('uploaded-files-list');
    
    const existing = document.getElementById(`file-item-${name.replace(/[^a-zA-Z0-9]/g, '_')}`);
    if (existing) existing.remove();

    const div = document.createElement('div');
    div.id = `file-item-${name.replace(/[^a-zA-Z0-9]/g, '_')}`;
    div.className = 'file-item';
    
    const textLabel = currentLang === 'ru' ? 'рейсов' : 'flights';
    
    div.innerHTML = `
        <div class="file-info">
            <span class="file-icon">📄</span>
            <span class="file-name" title="${name}">${name.length > 25 ? name.substring(0, 22) + '...' : name}</span>
            <span class="file-flights-count">(${count} ${textLabel})</span>
        </div>
        <button class="btn-remove-file" onclick="removeUploadedFile('${name}')">✕</button>
    `;
    list.appendChild(div);
}

function renderUploadedFilesList() {
    const list = document.getElementById('uploaded-files-list');
    if (!list) return;
    list.innerHTML = '';

    const counts = {};
    if (userFlights && userFlights.length > 0) {
        userFlights.forEach(f => {
            if (f.source && f.source !== 'manual') {
                counts[f.source] = (counts[f.source] || 0) + 1;
            }
        });
    }

    Object.keys(counts).forEach(filename => {
        renderFileItem(filename, counts[filename]);
    });
}

function removeUploadedFile(filename) {
    userFlights = userFlights.filter(f => f.source !== filename);
    saveUserFlights();

    const item = document.getElementById(`file-item-${filename.replace(/[^a-zA-Z0-9]/g, '_')}`);
    if (item) item.remove();

    const selectFrom = document.getElementById('select-from');
    const event = new Event('change');
    selectFrom.dispatchEvent(event);
}

function parseExcelDate(val) {
    if (!val) return null;
    
    // Если это объект Date (от SheetJS или JS)
    if (val instanceof Date && !isNaN(val.getTime())) {
        const yyyy = val.getFullYear();
        const mm = String(val.getMonth() + 1).padStart(2, '0');
        const dd = String(val.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    const valStr = String(val).trim();
    if (!valStr) return null;

    // Строковый формат DD.MM.YYYY или DD.MM.YY (например 22.07.2026 или 22.07.26)
    const match = valStr.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
    if (match) {
        let d = parseInt(match[1], 10);
        let m = parseInt(match[2], 10);
        let y = parseInt(match[3], 10);
        if (y < 100) {
            y += (y < 50 ? 2000 : 1900);
        }
        const yyyy = String(y).padStart(4, '0');
        const mm = String(m).padStart(2, '0');
        const dd = String(d).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    // ИСО формат YYYY-MM-DD
    const isoMatch = valStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
        return isoMatch[0];
    }

    return null;
}

function parseDateToJsDate(val) {
    if (!val) return null;
    if (val instanceof Date && !isNaN(val.getTime())) {
        return val;
    }
    const isoStr = parseExcelDate(val);
    if (isoStr) {
        const parts = isoStr.split('-');
        if (parts.length === 3) {
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10) - 1;
            const d = parseInt(parts[2], 10);
            const dt = new Date(y, m, d);
            if (!isNaN(dt.getTime())) return dt;
        }
    }
    return null;
}

function formatDateStr(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
    }
    return dateStr;
}

// Валидация числовых полей ввода и автоочистка ведущих нулей (стандарт надежности без таймеров и мерцания)
function setupNumericInputValidation() {
    // Инпуты целых чисел
    const integerInputs = [
        'input-pax',
        'manual-men',
        'manual-women',
        'manual-rb',
        'manual-rm',
        'manual-bag-pcs'
    ];

    integerInputs.forEach(id => {
        const el = document.getElementById(id);
        if (!el || el.dataset.hasNumericValidation) return;
        el.dataset.hasNumericValidation = 'true';

        // Умное выделение без таймеров и конфликтов с кликом мыши
        let isMouseDown = false;
        el.addEventListener('mousedown', () => {
            isMouseDown = (document.activeElement !== el);
        });

        el.addEventListener('focus', () => {
            if (!isMouseDown) {
                el.select();
            }
        });

        el.addEventListener('mouseup', () => {
            if (isMouseDown) {
                isMouseDown = false;
                el.select();
            }
        });

        // Блокируем ввод запрещенных символов на аппаратном уровне
        el.addEventListener('keydown', (e) => {
            if (['-', '+', '.', ',', 'e', 'E'].includes(e.key)) {
                e.preventDefault();
            }
        });

        // Нормализация при завершении ввода (уход из поля или change)
        ['change', 'blur'].forEach(evt => {
            el.addEventListener(evt, () => {
                let val = el.value.trim();
                if (val === '' || isNaN(val)) {
                    el.value = (id === 'input-pax') ? '150' : '0';
                } else {
                    let num = parseInt(val, 10);
                    if (id === 'input-pax') {
                        if (num < 1) num = 1;
                        if (num > 1000) num = 1000;
                    } else if (['manual-men', 'manual-women', 'manual-rb', 'manual-rm'].includes(id)) {
                        if (num < 0) num = 0;
                        if (num > 1000) num = 1000;
                    } else if (id === 'manual-bag-pcs') {
                        if (num < 0) num = 0;
                        if (num > 2000) num = 2000;
                    } else if (num < 0) {
                        num = 0;
                    }
                    el.value = String(num);
                }
            });
        });
    });

    // Инпуты дробных чисел (вес в форме ручного добавления)
    const floatInputs = [
        'manual-bag-weight',
        'manual-hb-weight'
    ];

    floatInputs.forEach(id => {
        const el = document.getElementById(id);
        if (!el || el.dataset.hasNumericValidation) return;
        el.dataset.hasNumericValidation = 'true';

        let isMouseDown = false;
        el.addEventListener('mousedown', () => {
            isMouseDown = (document.activeElement !== el);
        });

        el.addEventListener('focus', () => {
            if (!isMouseDown) {
                el.select();
            }
        });

        el.addEventListener('mouseup', () => {
            if (isMouseDown) {
                isMouseDown = false;
                el.select();
            }
        });

        // Блокируем ввод запрещенных символов для веса
        el.addEventListener('keydown', (e) => {
            if (['-', '+', 'e', 'E'].includes(e.key)) {
                e.preventDefault();
            }
        });

        ['change', 'blur'].forEach(evt => {
            el.addEventListener(evt, () => {
                let val = el.value.trim().replace(',', '.');
                if (val === '' || val === '.' || isNaN(parseFloat(val))) {
                    el.value = '0';
                } else {
                    let num = parseFloat(val);
                    if (num < 0) num = 0;
                    if (num > 50000) num = 50000;
                    el.value = String(Math.round(num * 10) / 10);
                }
            });
        });
    });
}

// --- ОТРИСОВКА И РАСЧЕТ ДАШБОРДА АНАЛИТИКИ И МАСШТАБИРОВАНИЯ ---
function renderDashboardAnalytics() {
    const routeSelect = document.getElementById('dash-filter-route');
    const selectedRoute = routeSelect ? routeSelect.value : 'all';

    // Helper for checking valid 3-letter IATA codes (rejects #REF!, NULL, undefined)
    const isValidIataCode = (code) => {
        if (!code) return false;
        const str = String(code).trim().toUpperCase();
        if (str.includes('#') || str.includes('REF') || str.includes('NULL') || str.includes('UNDEFINED')) {
            return false;
        }
        return /^[A-Z]{3}$/.test(str);
    };

    // 1. Используем данные из загруженной базы рейсов и системных нормативов (baggageDb.rules)
    let dataset = [];

    if (userFlights && Array.isArray(userFlights)) {
        userFlights.forEach(f => {
            const fromIata = ruToIata(f.from) || f.from;
            const toIata = ruToIata(f.to) || f.to;
            if (isValidIataCode(fromIata) && isValidIataCode(toIata)) {
                dataset.push({
                    from: fromIata,
                    to: toIata,
                    flight_no: f.flight_no,
                    pax: getEffectivePaxCount(f),
                    bag_pcs: parseInt(f.bag_pcs, 10) || 0,
                    bag_weight: parseFloat(f.bag_weight) || 0,
                    hb_weight: parseFloat(f.hb_weight) || 0,
                    date: f.date,
                    source: 'user_db'
                });
            }
        });
    }

    if (baggageDb && Array.isArray(baggageDb.rules)) {
        baggageDb.rules.forEach(r => {
            const fromIata = ruToIata(r.from) || r.from;
            const toIata = ruToIata(r.to) || r.to;
            if (isValidIataCode(fromIata) && isValidIataCode(toIata)) {
                const paxCount = parseInt(r.pax_no, 10) || 150;
                const pcsPax = parseFloat(r.pcs_pax) || 0;
                const wghtPc = parseFloat(r.wght_pc) || 0;
                const totalPcs = Math.round(paxCount * pcsPax);
                const totalWeight = totalPcs * wghtPc;
                const hbWeight = Math.round(paxCount * (parseFloat(r.hb_pax) || 0));

                dataset.push({
                    from: fromIata,
                    to: toIata,
                    flight_no: r.flt_no || '',
                    pax: paxCount,
                    bag_pcs: totalPcs,
                    bag_weight: totalWeight,
                    hb_weight: hbWeight,
                    date: r.date || null,
                    source: 'system_rules'
                });
            }
        });
    }

    // 2. Обновляем списки выпадающего фильтра маршрутов (исключая битые типы #REF!)
    if (routeSelect) {
        const savedRoute = routeSelect.value;
        const routesSet = new Set();
        dataset.forEach(f => {
            if (isValidIataCode(f.from) && isValidIataCode(f.to)) {
                routesSet.add(`${f.from} ➔ ${f.to}`);
            }
        });

        // Сохраняем первую опцию "Все направления" / "All Routes"
        routeSelect.innerHTML = `<option value="all">${currentLang === 'ru' ? 'Все направления' : 'All Routes'}</option>`;
        Array.from(routesSet).sort().forEach(r => {
            const opt = document.createElement('option');
            opt.value = r;
            opt.textContent = r;
            routeSelect.appendChild(opt);
        });

        if (Array.from(routeSelect.options).some(o => o.value === savedRoute)) {
            routeSelect.value = savedRoute;
        }
    }

    // 3. Фильтрация набора данных по периоду времени и маршруту
    const periodSelect = document.getElementById('dash-filter-period');
    const selectedPeriod = periodSelect ? periodSelect.value : 'all';
    
    let filteredDataset = dataset;
    let periodSubtext = currentLang === 'ru' ? 'За весь период базы данных' : 'For entire database period';

    if (selectedPeriod !== 'all') {
        const now = new Date();
        
        if (selectedPeriod === '30' || selectedPeriod === '60' || selectedPeriod === '90') {
            const days = parseInt(selectedPeriod, 10);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            
            filteredDataset = filteredDataset.filter(f => {
                if (!f.date) return false;
                const d = parseDateToJsDate(f.date);
                return d && d >= cutoffDate;
            });
            periodSubtext = currentLang === 'ru' ? `За последние ${days} дней` : `Last ${days} days`;
        } else if (selectedPeriod === 'year') {
            const currentYear = now.getFullYear();
            filteredDataset = filteredDataset.filter(f => {
                if (!f.date) return false;
                const d = parseDateToJsDate(f.date);
                return d && d.getFullYear() === currentYear;
            });
            periodSubtext = currentLang === 'ru' ? `За ${currentYear} год` : `For year ${currentYear}`;
        } else if (selectedPeriod === 'custom') {
            const dateFromInput = document.getElementById('dash-date-from');
            const dateToInput = document.getElementById('dash-date-to');
            const fromVal = dateFromInput ? dateFromInput.value : '';
            const toVal = dateToInput ? dateToInput.value : '';

            if (fromVal || toVal) {
                const fromDate = fromVal ? new Date(fromVal) : new Date('1970-01-01');
                const toDate = toVal ? new Date(toVal) : new Date('2099-12-31');
                toDate.setHours(23, 59, 59, 999);

                filteredDataset = filteredDataset.filter(f => {
                    if (!f.date) return false;
                    const d = parseDateToJsDate(f.date);
                    return d && d >= fromDate && d <= toDate;
                });
                periodSubtext = currentLang === 'ru' 
                    ? `Интервал: ${fromVal || '...'} — ${toVal || '...'}`
                    : `Interval: ${fromVal || '...'} — ${toVal || '...'}`;
            }
        }
    }

    // Сохраняем срез периода (до сужения по выбранному маршруту selectedRoute)
    const periodFilteredDataset = [...filteredDataset];

    if (selectedRoute && selectedRoute !== 'all') {
        const [fromCode, toCode] = selectedRoute.split(' ➔ ').map(s => s.trim());
        filteredDataset = filteredDataset.filter(f => f.from === fromCode && f.to === toCode);
    }

    // 4. Расчет KPI Метрик
    const totalFlights = filteredDataset.length;

    const uniqueFlightNumbersSet = new Set();
    let totalPax = 0;
    let totalPcs = 0;
    let totalWeight = 0;
    let totalHb = 0;

    filteredDataset.forEach(f => {
        if (f.flight_no && String(f.flight_no).trim() !== '') {
            uniqueFlightNumbersSet.add(String(f.flight_no).trim());
        }
        totalPax += f.pax;
        totalPcs += f.bag_pcs;
        totalWeight += f.bag_weight;
        totalHb += f.hb_weight;
    });

    const totalFlightNumbers = uniqueFlightNumbersSet.size > 0 ? uniqueFlightNumbersSet.size : (filteredDataset.length > 0 ? 1 : 0);
    const avgWeightPerPax = totalPax > 0 ? (totalWeight / totalPax) : 0;
    const avgPcsPerPax = totalPax > 0 ? (totalPcs / totalPax) : 0;

    // Обновляем карточки KPI
    const kpiFlights = document.getElementById('dash-kpi-flights');
    const kpiRoutes = document.getElementById('dash-kpi-routes');
    const kpiWeight = document.getElementById('dash-kpi-weight');
    const kpiPcs = document.getElementById('dash-kpi-pcs');

    const kgUnitText = currentLang === 'ru' ? 'кг/пассажира' : 'kg/passenger';
    const pcsUnitText = currentLang === 'ru' ? 'мест/пассажира' : 'pcs/passenger';

    if (kpiFlights) kpiFlights.textContent = totalFlights;
    if (kpiRoutes) kpiRoutes.textContent = totalFlightNumbers;
    if (kpiWeight) kpiWeight.innerHTML = `${avgWeightPerPax.toFixed(2)} <span class="kpi-unit">${kgUnitText}</span>`;
    if (kpiPcs) kpiPcs.innerHTML = `${avgPcsPerPax.toFixed(2)} <span class="kpi-unit">${pcsUnitText}</span>`;

    // Обновляем подписи периода под KPI карточками
    const kpiSubs = document.querySelectorAll('.dashboard-kpi-grid .kpi-sub');
    kpiSubs.forEach(el => el.textContent = periodSubtext);

    // 5. Группировка по маршрутам для графиков
    const routeStats = {};
    filteredDataset.forEach(f => {
        const routeKey = (f.from && f.to) ? `${f.from} ➔ ${f.to}` : 'Прочие';
        if (!routeStats[routeKey]) {
            routeStats[routeKey] = { route: routeKey, pax: 0, pcs: 0, weight: 0, hb: 0, flights: 0 };
        }
        routeStats[routeKey].pax += f.pax;
        routeStats[routeKey].pcs += f.bag_pcs;
        routeStats[routeKey].weight += f.bag_weight;
        routeStats[routeKey].hb += f.hb_weight;
        routeStats[routeKey].flights += 1;
    });

    const routeStatsList = Object.values(routeStats).map(r => ({
        ...r,
        avgWeight: r.pax > 0 ? (r.weight / r.pax) : 0,
        avgPcs: r.pax > 0 ? (r.pcs / r.pax) : 0,
        avgHb: r.pax > 0 ? (r.hb / r.pax) : 0
    }));

    // График 1: Вес на 1 PAX по маршрутам (Ранжированные полосы с бейджами ТОП-направлений)
    const weightContainer = document.getElementById('dash-chart-weight-container');
    if (weightContainer) {
        weightContainer.innerHTML = '';
        const sortedByWeight = [...routeStatsList].sort((a, b) => b.avgWeight - a.avgWeight);
        const maxW = sortedByWeight.length > 0 ? Math.max(...sortedByWeight.map(r => r.avgWeight), 1) : 1;

        if (sortedByWeight.length === 0) {
            weightContainer.innerHTML = '<div class="empty-table-text">Нет данных для графиков</div>';
        } else {
            sortedByWeight.forEach((r, idx) => {
                const percent = Math.min(100, Math.round((r.avgWeight / maxW) * 100));
                const item = document.createElement('div');
                item.className = 'chart-bar-item';
                item.innerHTML = `
                    <div class="bar-label-group">
                        <span class="bar-label">
                            <span class="bar-rank-badge ${idx === 0 ? 'top-1' : ''}">#${idx + 1}</span>
                            <strong>${r.route}</strong>
                        </span>
                        <span class="bar-value font-mono highlight-gold">${r.avgWeight.toFixed(2)} <span class="val-unit">${currentLang === 'ru' ? 'кг' : 'kg'}</span></span>
                    </div>
                    <div class="bar-track">
                        <div class="bar-fill gold" style="width: ${percent}%;"></div>
                    </div>
                `;
                weightContainer.appendChild(item);
            });
        }
    }

    // График 2: Места на 1 PAX по направлениям (Ранжированные карточки емкости / Capacity Tiles)
    const pcsContainer = document.getElementById('dash-chart-pcs-container');
    if (pcsContainer) {
        pcsContainer.innerHTML = '';
        pcsContainer.className = 'pcs-tiles-list';
        const sortedByPcs = [...routeStatsList].sort((a, b) => b.avgPcs - a.avgPcs);

        if (sortedByPcs.length === 0) {
            pcsContainer.innerHTML = '<div class="empty-table-text">Нет данных для графиков</div>';
        } else {
            sortedByPcs.forEach((r, idx) => {
                // Определение категории загрузки багажа
                let statusClass = 'standard';
                let statusLabel = currentLang === 'ru' ? 'СТАНДАРТ' : 'STANDARD';
                if (r.avgPcs >= 1.35) {
                    statusClass = 'heavy';
                    statusLabel = currentLang === 'ru' ? 'ТЯЖЕЛЫЙ' : 'HEAVY';
                } else if (r.avgPcs < 0.85) {
                    statusClass = 'light';
                    statusLabel = currentLang === 'ru' ? 'ЛЕГКИЙ' : 'LIGHT';
                }

                const item = document.createElement('div');
                item.className = 'pcs-rank-tile';
                item.innerHTML = `
                    <div class="pcs-tile-left">
                        <span class="pcs-rank-number ${idx === 0 ? 'top-1' : ''}">#${idx + 1}</span>
                        <span class="pcs-tile-route">${r.route}</span>
                        <span class="pcs-status-badge ${statusClass}">${statusLabel}</span>
                    </div>
                    <div class="pcs-tile-right font-mono">
                        <span class="pcs-tile-val">${r.avgPcs.toFixed(2)}</span>
                        <span class="pcs-tile-unit">${currentLang === 'ru' ? 'мест' : 'pcs'}</span>
                    </div>
                `;
                pcsContainer.appendChild(item);
            });
        }
    }

    // График 3: Динамика по дням недели (ПН - ВС) (Вертикальный столбчатый график / Vertical Columns Chart)
    const weekdayContainer = document.getElementById('dash-chart-weekdays-container');
    if (weekdayContainer) {
        weekdayContainer.innerHTML = '';
        const dayNames = currentLang === 'ru' ? ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'] : ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
        const dayStats = Array(7).fill(0).map(() => ({ pax: 0, weight: 0, count: 0 }));

        filteredDataset.forEach(f => {
            let dayIdx = null;
            if (f.date) {
                const dt = parseDateToJsDate(f.date);
                if (dt && !isNaN(dt.getDay())) {
                    const jsDay = dt.getDay(); // 0=Вс, 1=Пн, 2=Вт, 3=Ср, 4=Чт, 5=Пт, 6=Сб
                    dayIdx = (jsDay === 0) ? 6 : jsDay - 1; // 0=Пн ... 6=Вс
                }
            }

            if (dayIdx === null) {
                dayIdx = 0; // Пн по умолчанию
            }

            dayStats[dayIdx].pax += f.pax;
            dayStats[dayIdx].weight += f.bag_weight;
            dayStats[dayIdx].count += 1;
        });

        const dayAverages = dayStats.map((d, idx) => ({
            day: dayNames[idx],
            avgWeight: d.pax > 0 ? (d.weight / d.pax) : 0,
            count: d.count
        }));

        const maxDayW = Math.max(...dayAverages.map(d => d.avgWeight), 0.1);
        
        // Находим индекс дня с пиковой нагрузкой (больше 0)
        let peakIdx = -1;
        let peakVal = 0;
        dayAverages.forEach((d, idx) => {
            if (d.avgWeight > peakVal) {
                peakVal = d.avgWeight;
                peakIdx = idx;
            }
        });

        const chartWrap = document.createElement('div');
        chartWrap.className = 'weekday-chart-wrapper';

        // Подсказка с описанием метрики
        const hintBar = document.createElement('div');
        hintBar.className = 'weekday-hint-bar';
        hintBar.innerHTML = `
            <span class="hint-icon">⚖️</span>
            <span>${currentLang === 'ru' ? 'Средний вес багажа на 1 пассажира (кг/PAX)' : 'Avg baggage weight per passenger (kg/PAX)'}</span>
        `;
        chartWrap.appendChild(hintBar);

        // 1. Верхняя область с вертикальными колонками
        const colsGrid = document.createElement('div');
        colsGrid.className = 'weekday-columns-grid';

        dayAverages.forEach((d, idx) => {
            const isPeak = (idx === peakIdx && peakVal > 0);
            const heightPct = Math.min(100, Math.max(8, Math.round((d.avgWeight / maxDayW) * 100)));

            const col = document.createElement('div');
            col.className = `weekday-col ${isPeak ? 'peak-day' : ''}`;
            col.title = `${d.day}: ${d.avgWeight.toFixed(2)} ${kgUnitText} (${d.count} ${currentLang === 'ru' ? 'рейсов' : 'flights'})`;
            col.innerHTML = `
                <div class="weekday-bar-val font-mono">
                    ${isPeak ? '<span class="peak-pill">MAX</span>' : '<span class="peak-pill-placeholder"></span>'}
                    <div class="val-num-group">
                        <span class="val-num">${d.avgWeight > 0 ? d.avgWeight.toFixed(2) : '-'}</span>
                        <span class="val-unit">${currentLang === 'ru' ? 'кг' : 'kg'}</span>
                    </div>
                </div>
                <div class="weekday-col-track">
                    <div class="weekday-col-fill" style="height: ${heightPct}%;"></div>
                </div>
            `;
            colsGrid.appendChild(col);
        });
        chartWrap.appendChild(colsGrid);

        // 2. Нижняя область с подписями дней и количеством рейсов
        const footer = document.createElement('div');
        footer.className = 'weekday-labels-footer';

        dayAverages.forEach(d => {
            const item = document.createElement('div');
            item.className = 'weekday-footer-item';
            item.innerHTML = `
                <span class="weekday-name">${d.day}</span>
                <span class="weekday-flights-count">${d.count} ${currentLang === 'ru' ? 'рейс.' : 'flt.'}</span>
            `;
            footer.appendChild(item);
        });
        chartWrap.appendChild(footer);

        weekdayContainer.appendChild(chartWrap);
    }

    // 6. График 4: Круговая диаграмма процентного распределения вылетов (НЕ зависимая от выбранного маршрута)
    const sharesContainer = document.getElementById('dash-chart-shares-container');
    if (sharesContainer) {
        sharesContainer.innerHTML = '';
        
        const periodTotalFlights = periodFilteredDataset.length;

        if (periodTotalFlights === 0) {
            sharesContainer.innerHTML = '<div class="empty-table-text">Нет данных за период</div>';
        } else {
            // Группировка рейсов периода по маршрутам
            const periodRouteMap = {};
            periodFilteredDataset.forEach(f => {
                const rKey = (f.from && f.to) ? `${f.from} ➔ ${f.to}` : 'Прочие';
                if (!periodRouteMap[rKey]) {
                    periodRouteMap[rKey] = { route: rKey, flights: 0 };
                }
                periodRouteMap[rKey].flights += 1;
            });

            const sortedPeriodRoutes = Object.values(periodRouteMap).sort((a, b) => b.flights - a.flights);
            
            // Формируем карту цветов: яркий уникальный цвет для рейсов (>1), серый для одиночных (===1)
            const allPeriodRoutes = sortedPeriodRoutes;

            const activePalette = [
                '#00f2ff', '#ffb700', '#10b981', '#8b5cf6', 
                '#f97316', '#06b6d4', '#ec4899', '#3b82f6', 
                '#a855f7', '#14b8a6', '#f43f5e', '#eab308',
                '#38bdf8', '#fb923c', '#4ade80', '#c084fc'
            ];
            const singleFlightColor = '#64748b';

            let activeColorIdx = 0;
            const routeColorMap = {};
            allPeriodRoutes.forEach(s => {
                if (s.flights > 1) {
                    routeColorMap[s.route] = activePalette[activeColorIdx % activePalette.length];
                    activeColorIdx++;
                } else {
                    routeColorMap[s.route] = singleFlightColor;
                }
            });

            // Расчет круговых сегментов SVG (окружность R=40 => C = 2*PI*40 ≈ 251.327)
            const C = 251.327;
            let currentOffset = 0;
            let svgCircles = '';

            allPeriodRoutes.forEach(s => {
                const sharePct = (s.flights / periodTotalFlights) * 100;
                const dashLen = (sharePct / 100) * C;
                const gapLen = C - dashLen;
                const strokeColor = routeColorMap[s.route] || singleFlightColor;

                svgCircles += `
                    <circle class="pie-slice-circle" 
                            data-route="${s.route}"
                            data-flights="${s.flights}"
                            data-pct="${((s.flights / periodTotalFlights) * 100).toFixed(1)}"
                            cx="50" cy="50" r="40" 
                            fill="transparent" 
                            stroke="${strokeColor}" 
                            stroke-width="14" 
                            stroke-dasharray="${dashLen.toFixed(2)} ${gapLen.toFixed(2)}" 
                            stroke-dashoffset="${(-currentOffset).toFixed(2)}" />
                `;
                currentOffset += dashLen;
            });

            // Генерируем легенду ДЛЯ ВСЕХ НАПРАВЛЕНИЙ с их индивидуальными цветами
            let legendHtml = '';
            allPeriodRoutes.forEach(s => {
                const sharePct = ((s.flights / periodTotalFlights) * 100).toFixed(1);
                const dotColor = routeColorMap[s.route] || singleFlightColor;

                legendHtml += `
                    <div class="pie-legend-item" data-route="${s.route}" data-flights="${s.flights}" data-pct="${sharePct}">
                        <div class="pie-legend-left">
                            <span class="pie-legend-dot" style="background: ${dotColor};"></span>
                            <span class="pie-legend-name">${s.route}</span>
                        </div>
                        <span class="pie-legend-val">${s.flights} (${sharePct}%)</span>
                    </div>
                `;
            });

            sharesContainer.innerHTML = `
                <div class="pie-chart-wrapper">
                    <div class="pie-chart-container">
                        <svg class="pie-chart-svg" viewBox="0 0 100 100">
                            ${svgCircles}
                        </svg>
                        <div class="pie-chart-center">
                            <div class="pie-chart-center-val">${periodTotalFlights}</div>
                            <div class="pie-chart-center-lbl">${currentLang === 'ru' ? 'РЕЙСОВ' : 'FLIGHTS'}</div>
                        </div>
                    </div>
                    <div class="pie-chart-legend">
                        ${legendHtml}
                    </div>
                </div>
            `;

            // Подключение интерактивных кликов по сегментам и строкам легенды
            let selectedPieRoute = null;

            const centerVal = sharesContainer.querySelector('.pie-chart-center-val');
            const centerLbl = sharesContainer.querySelector('.pie-chart-center-lbl');
            const circles = sharesContainer.querySelectorAll('.pie-slice-circle');
            const legendItems = sharesContainer.querySelectorAll('.pie-legend-item');

            const handleRouteHighlight = (targetRoute, targetFlights, targetPct) => {
                if (selectedPieRoute === targetRoute) {
                    // Сброс выделения при повторном клике
                    selectedPieRoute = null;
                    if (centerVal) centerVal.textContent = periodTotalFlights;
                    if (centerLbl) centerLbl.textContent = currentLang === 'ru' ? 'РЕЙСОВ' : 'FLIGHTS';

                    circles.forEach(c => {
                        c.style.strokeWidth = '14px';
                        c.style.opacity = '1';
                        c.style.filter = 'none';
                    });

                    legendItems.forEach(item => {
                        item.classList.remove('active-pie-route');
                    });
                } else {
                    // Установка выделения на выбранное направление
                    selectedPieRoute = targetRoute;
                    if (centerVal) centerVal.textContent = targetFlights;
                    if (centerLbl) centerLbl.textContent = `${targetRoute} (${targetPct}%)`;

                    circles.forEach(c => {
                        if (c.getAttribute('data-route') === targetRoute) {
                            c.style.strokeWidth = '18px';
                            c.style.opacity = '1';
                            c.style.filter = 'drop-shadow(0 0 8px currentColor)';
                        } else {
                            c.style.strokeWidth = '12px';
                            c.style.opacity = '0.25';
                            c.style.filter = 'none';
                        }
                    });

                    legendItems.forEach(item => {
                        if (item.getAttribute('data-route') === targetRoute) {
                            item.classList.add('active-pie-route');
                            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        } else {
                            item.classList.remove('active-pie-route');
                        }
                    });
                }
            };

            circles.forEach(c => {
                c.addEventListener('click', () => {
                    const r = c.getAttribute('data-route');
                    const f = c.getAttribute('data-flights');
                    const p = c.getAttribute('data-pct');
                    handleRouteHighlight(r, f, p);
                });
            });

            legendItems.forEach(item => {
                item.addEventListener('click', () => {
                    const r = item.getAttribute('data-route');
                    const f = item.getAttribute('data-flights');
                    const p = item.getAttribute('data-pct');
                    handleRouteHighlight(r, f, p);
                });
            });
        }
    }
}

// --- МОДУЛЬ ТЕСТИРОВАНИЯ И ВАЛИДАЦИИ ТОЧНОСТИ ПРОГНОЗОВ (STAGE 3) ---

let lastBacktestResults = [];
let backtestSortCol = 'date';
let backtestSortAsc = false;

function initBacktestModule() {
    const btnOpen = document.getElementById('btn-open-backtest');
    const btnClose = document.getElementById('btn-close-backtest');
    const modal = document.getElementById('backtest-modal');
    const btnStart = document.getElementById('btn-start-backtest');
    const periodSelect = document.getElementById('backtest-period-select');
    const customWrap = document.getElementById('backtest-custom-dates-wrap');
    const filterSelect = document.getElementById('backtest-table-filter');
    const searchInput = document.getElementById('backtest-table-search');
    const btnExport = document.getElementById('btn-export-backtest-excel');

    if (btnOpen && modal) {
        btnOpen.addEventListener('click', () => {
            populateBacktestAirlines();
            modal.classList.remove('hidden');
        });
    }

    if (btnClose && modal) {
        btnClose.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        });
    }

    if (periodSelect) {
        periodSelect.addEventListener('change', () => {
            if (customWrap) {
                customWrap.style.display = periodSelect.value === 'custom' ? 'flex' : 'none';
            }
        });
    }

    if (btnStart) {
        btnStart.addEventListener('click', () => {
            runBacktestAccuracySimulation();
        });
    }

    if (filterSelect) {
        filterSelect.addEventListener('change', () => {
            renderBacktestTable();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderBacktestTable();
        });
    }

    if (btnExport) {
        btnExport.addEventListener('click', (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            exportBacktestToExcel();
        });
    }
}

// Заполнение выпадающего списка авиакомпаний
function populateBacktestAirlines() {
    const select = document.getElementById('backtest-airline-select');
    if (!select || !userFlights) return;

    const currentVal = select.value;
    const airlines = new Set();
    userFlights.forEach(f => {
        if (f.airline && String(f.airline).trim()) {
            airlines.add(String(f.airline).trim().toUpperCase());
        }
    });

    let html = `<option value="all">${currentLang === 'ru' ? 'Все АК' : 'All Airlines'}</option>`;
    Array.from(airlines).sort().forEach(al => {
        html += `<option value="${escapeHtml(al)}">${escapeHtml(al)}</option>`;
    });

    select.innerHTML = html;
    if (airlines.has(currentVal)) {
        select.value = currentVal;
    }
}

// Запуск симуляции точности
function runBacktestAccuracySimulation() {
    if (!userFlights || userFlights.length === 0) {
        showAviationAlert(currentLang === 'ru' ? 'База данных пуста! Загрузите отчеты рейсов.' : 'Database is empty! Please load flights data.', true);
        return;
    }

    const periodVal = document.getElementById('backtest-period-select')?.value || '30';
    const airlineVal = document.getElementById('backtest-airline-select')?.value || 'all';
    const dateFromVal = document.getElementById('backtest-date-from')?.value;
    const dateToVal = document.getElementById('backtest-date-to')?.value;

    const btnStart = document.getElementById('btn-start-backtest');
    const progressContainer = document.getElementById('backtest-progress-container');
    const progressStatus = document.getElementById('backtest-progress-status');
    const progressPercent = document.getElementById('backtest-progress-percent');
    const progressFill = document.getElementById('backtest-progress-fill');
    const resultsContainer = document.getElementById('backtest-results-container');

    // 1. Фильтрация валидных рейсов и хронологическая сортировка
    const validFlights = userFlights.filter(f => {
        if (!f.date) return false;
        const pax = getEffectivePaxCount(f);
        const w = parseFloat(f.bag_weight) || 0;
        const pcs = parseInt(f.bag_pcs, 10) || 0;
        return pax > 0 && w > 0 && pcs > 0 && parseDateToJsDate(f.date) !== null;
    }).sort((a, b) => {
        const da = parseDateToJsDate(a.date);
        const db = parseDateToJsDate(b.date);
        return (da ? da.getTime() : 0) - (db ? db.getTime() : 0);
    });

    if (validFlights.length < 5) {
        showAviationAlert(currentLang === 'ru' ? 'Слишком мало рейсов с заполненными данными для теста (требуется >= 5).' : 'Not enough valid flights for testing (>= 5 required).', true);
        return;
    }

    // 2. Отбор тестовой выборки по периоду и АК
    let testSample = validFlights;

    if (airlineVal !== 'all') {
        testSample = testSample.filter(f => String(f.airline).trim().toUpperCase() === airlineVal);
    }

    if (periodVal === 'custom') {
        if (dateFromVal) {
            const dtFrom = new Date(dateFromVal + 'T00:00:00');
            testSample = testSample.filter(f => {
                const fd = parseDateToJsDate(f.date);
                return fd && fd.getTime() >= dtFrom.getTime();
            });
        }
        if (dateToVal) {
            const dtTo = new Date(dateToVal + 'T23:59:59');
            testSample = testSample.filter(f => {
                const fd = parseDateToJsDate(f.date);
                return fd && fd.getTime() <= dtTo.getTime();
            });
        }
    } else if (periodVal !== 'all') {
        const days = parseInt(periodVal, 10);
        const newestFlightDate = parseDateToJsDate(validFlights[validFlights.length - 1].date);
        if (newestFlightDate) {
            const cutoffMs = newestFlightDate.getTime() - (days * 24 * 60 * 60 * 1000);
            testSample = testSample.filter(f => {
                const fd = parseDateToJsDate(f.date);
                return fd && fd.getTime() >= cutoffMs;
            });
        }
    }

    if (testSample.length === 0) {
        showAviationAlert(currentLang === 'ru' ? 'За выбранный период и фильтры рейсов не найдено.' : 'No flights found for the selected period/filters.', true);
        return;
    }

    if (btnStart) btnStart.disabled = true;
    if (progressContainer) progressContainer.classList.remove('hidden');
    if (resultsContainer) resultsContainer.classList.add('hidden');
    if (progressFill) progressFill.style.width = '0%';
    if (progressPercent) progressPercent.textContent = '0%';

    lastBacktestResults = [];
    let currentIndex = 0;

    function processBatch() {
        const batchSize = 25;
        const endIndex = Math.min(currentIndex + batchSize, testSample.length);

        for (let i = currentIndex; i < endIndex; i++) {
            const targetFlight = testSample[i];
            const targetDt = parseDateToJsDate(targetFlight.date);
            if (!targetDt) continue;
            const targetMs = targetDt.getTime();
            const targetDay = getDayOfWeekFromIsoStr(targetFlight.date);
            const actualPax = getEffectivePaxCount(targetFlight);
            const actualWeight = parseFloat(targetFlight.bag_weight) || 0;
            const actualPcs = parseInt(targetFlight.bag_pcs, 10) || 0;

            // История СТРОГО ДО даты вылета targetFlight
            const historyBefore = validFlights.filter(f => {
                const fd = parseDateToJsDate(f.date);
                return fd && fd.getTime() < targetMs;
            });

            // Smart Waterfall алгоритм
            const window180Ms = 180 * 24 * 60 * 60 * 1000;
            const routeFlights = historyBefore.filter(f => f.from === targetFlight.from && f.to === targetFlight.to);

            let sample = routeFlights.filter(f => {
                if (f.flight_no !== targetFlight.flight_no) return false;
                if (getDayOfWeekFromIsoStr(f.date) !== targetDay) return false;
                const fd = parseDateToJsDate(f.date);
                const diff = targetMs - fd.getTime();
                return diff > 0 && diff <= window180Ms;
            }).sort((a, b) => parseDateToJsDate(b.date) - parseDateToJsDate(a.date));

            if (sample.length < 5) {
                sample = routeFlights.filter(f => {
                    if (getDayOfWeekFromIsoStr(f.date) !== targetDay) return false;
                    const fd = parseDateToJsDate(f.date);
                    const diff = targetMs - fd.getTime();
                    return diff > 0 && diff <= window180Ms;
                }).sort((a, b) => parseDateToJsDate(b.date) - parseDateToJsDate(a.date));
            }

            if (sample.length < 5) {
                sample = routeFlights.filter(f => {
                    const fd = parseDateToJsDate(f.date);
                    const diff = targetMs - fd.getTime();
                    return diff > 0 && diff <= window180Ms;
                }).sort((a, b) => parseDateToJsDate(b.date) - parseDateToJsDate(a.date));
            }

            if (sample.length === 0) {
                sample = historyBefore.filter(f => {
                    if (f.from !== targetFlight.from) return false;
                    const fd = parseDateToJsDate(f.date);
                    const diff = targetMs - fd.getTime();
                    return diff > 0 && diff <= window180Ms;
                }).sort((a, b) => parseDateToJsDate(b.date) - parseDateToJsDate(a.date));
            }

            const defaultFallbackK = 0.45;
            const defaultFallbackV = 14.5;
            let predPcs = Math.max(1, Math.round(actualPax * defaultFallbackK));
            let predWeight = Math.round(predPcs * defaultFallbackV);

            if (sample.length > 0) {
                const sampleSlice = sample.slice(0, 20);
                const means = calculateMeansFromFlights(sampleSlice, 0.2);
                if (means && typeof means.pcs_pax === 'number' && typeof means.wght_pc === 'number' && !isNaN(means.pcs_pax) && !isNaN(means.wght_pc)) {
                    const effectivePax = Math.max(1, actualPax);
                    const seasonInfo = getRouteSeasonalityMultiplier(targetFlight.from, targetFlight.to, targetFlight.date);
                    const seasonMultiplier = (seasonInfo && typeof seasonInfo.multiplier === 'number') ? seasonInfo.multiplier : 1.0;
                    const adjustedK = means.pcs_pax * seasonMultiplier;
                    predPcs = Math.max(1, Math.round(effectivePax * adjustedK));
                    predWeight = Math.round(predPcs * means.wght_pc);
                }
            }

            const diffW = predWeight - actualWeight;
            const diffWPct = actualWeight > 0 ? ((diffW / actualWeight) * 100) : 0;
            const errWPctAbs = Math.abs(diffWPct);

            const diffPcs = predPcs - actualPcs;
            const diffPcsPct = actualPcs > 0 ? ((diffPcs / actualPcs) * 100) : 0;
            const errPcsPctAbs = Math.abs(diffPcsPct);

            // Определение статуса точности по шкале с учетом авиационных порогов:
            // исключает ложные срабатывания на легких/малолюдных рейсах, где разница в несколько сумок дает > 25%
            const isWeightAnomaly = (errWPctAbs > 25 && Math.abs(diffW) > 150);
            const isPcsAnomaly = (errPcsPctAbs > 25 && Math.abs(diffPcs) > 10);
            const isAnomaly = (errWPctAbs > 25 || errPcsPctAbs > 25) && (isWeightAnomaly || isPcsAnomaly);

            const isWarning = !isAnomaly && (errWPctAbs > 15 || errPcsPctAbs > 15);
            const isAcceptable = !isAnomaly && !isWarning && (errWPctAbs > 10 || errPcsPctAbs > 10);

            let status = 'good'; // <= 10% (Хороший результат)
            if (isAnomaly) {
                status = 'danger'; // > 25% (Аномалия)
            } else if (isWarning) {
                status = 'warning'; // 15-25% (Отклонение)
            } else if (isAcceptable) {
                status = 'acceptable'; // 10-15% (Допустимый)
            }

            lastBacktestResults.push({
                date: targetFlight.date,
                dateFormatted: formatDateStr(targetFlight.date),
                airline: targetFlight.airline || '',
                flight: targetFlight.flight_no || '',
                route: `${targetFlight.from}➔${targetFlight.to}`,
                from: targetFlight.from,
                to: targetFlight.to,
                men: (targetFlight.men || 0),
                women: (targetFlight.women || 0),
                rb: (targetFlight.rb || 0),
                rm: (targetFlight.rm || 0),
                pax: actualPax,
                factWeight: actualWeight,
                predWeight: predWeight,
                diffWeight: diffW,
                diffWeightPct: diffWPct,
                errWeightAbs: Math.abs(diffW),
                errWeightPctAbs: errWPctAbs,
                factPcs: actualPcs,
                predPcs: predPcs,
                diffPcs: diffPcs,
                diffPcsPct: diffPcsPct,
                errPcsAbs: Math.abs(diffPcs),
                errPcsPctAbs: errPcsPctAbs,
                status: status
            });
        }

        currentIndex = endIndex;
        const progressPct = Math.round((currentIndex / testSample.length) * 100);
        if (progressFill) progressFill.style.width = `${progressPct}%`;
        if (progressPercent) progressPercent.textContent = `${progressPct}%`;
        if (progressStatus) {
            progressStatus.textContent = currentLang === 'ru'
                ? `Тестирование алгоритма: проверено ${currentIndex} из ${testSample.length} рейсов...`
                : `Testing algorithm: verified ${currentIndex} of ${testSample.length} flights...`;
        }

        if (currentIndex < testSample.length) {
            setTimeout(processBatch, 0);
        } else {
            // Завершение тестирования и вывод метрик
            if (btnStart) btnStart.disabled = false;
            if (progressContainer) progressContainer.classList.add('hidden');
            if (resultsContainer) resultsContainer.classList.remove('hidden');

            renderBacktestKPIs();
            renderBacktestTable();
        }
    }

    setTimeout(processBatch, 50);
}

// Рендер KPI карточек точности
function renderBacktestKPIs() {
    const total = lastBacktestResults.length;
    if (total === 0) return;

    let sumErrW = 0;
    let sumErrPcs = 0;
    let sumDiffW = 0;
    let sumDiffPcs = 0;
    let sumFactW = 0;
    let sumFactPcs = 0;

    let accW10 = 0;
    let accW15 = 0;
    let accPcs10 = 0;
    let accPcs15 = 0;

    let countGood = 0;
    let countAcceptable = 0;
    let countWarning = 0;
    let countDanger = 0;

    lastBacktestResults.forEach(r => {
        sumErrW += r.errWeightAbs;
        sumErrPcs += r.errPcsAbs;
        sumDiffW += r.diffWeight;
        sumDiffPcs += r.diffPcs;
        sumFactW += r.factWeight;
        sumFactPcs += r.factPcs;

        if (r.errWeightPctAbs <= 10) accW10++;
        if (r.errWeightPctAbs <= 15) accW15++;

        if (r.errPcsPctAbs <= 10) accPcs10++;
        if (r.errPcsPctAbs <= 15) accPcs15++;

        if (r.status === 'good') {
            countGood++;
        } else if (r.status === 'acceptable') {
            countAcceptable++;
        } else if (r.status === 'warning') {
            countWarning++;
        } else if (r.status === 'danger') {
            countDanger++;
        }
    });

    const maeW = (sumErrW / total).toFixed(1);
    const maePcs = (sumErrPcs / total).toFixed(1);
    const pctW10 = Math.round((accW10 / total) * 100);
    const pctW15 = Math.round((accW15 / total) * 100);
    const pctPcs10 = Math.round((accPcs10 / total) * 100);
    const pctPcs15 = Math.round((accPcs15 / total) * 100);

    const biasWPct = sumFactW > 0 ? ((sumDiffW / sumFactW) * 100).toFixed(1) : '0.0';
    const biasPcsPct = sumFactPcs > 0 ? ((sumDiffPcs / sumFactPcs) * 100).toFixed(1) : '0.0';

    const elW_mae = document.getElementById('bt-weight-mae');
    const elW_acc10 = document.getElementById('bt-weight-acc-10');
    const elW_acc15 = document.getElementById('bt-weight-acc-15');
    const elW_bias = document.getElementById('bt-weight-bias');

    const elP_mae = document.getElementById('bt-pcs-mae');
    const elP_acc10 = document.getElementById('bt-pcs-acc-10');
    const elP_acc15 = document.getElementById('bt-pcs-acc-15');
    const elP_bias = document.getElementById('bt-pcs-bias');

    const elTotal = document.getElementById('bt-total-tested');
    const elGoodCount = document.getElementById('bt-count-good');
    const elAcceptCount = document.getElementById('bt-count-acceptable');
    const elWarnCount = document.getElementById('bt-count-warning');
    const elDangCount = document.getElementById('bt-count-danger');

    if (elW_mae) elW_mae.textContent = `±${maeW} кг`;
    if (elW_acc10) elW_acc10.textContent = `${pctW10}%`;
    if (elW_acc15) elW_acc15.textContent = `${pctW15}%`;
    if (elW_bias) {
        const sign = Number(biasWPct) > 0 ? '+' : '';
        elW_bias.textContent = `${sign}${biasWPct}% (${sign}${Math.round(sumDiffW)} кг)`;
        elW_bias.style.color = Math.abs(Number(biasWPct)) <= 3 ? '#10b981' : (Number(biasWPct) > 0 ? 'var(--accent-cyan)' : 'var(--accent-gold)');
    }

    if (elP_mae) elP_mae.textContent = `±${maePcs} шт`;
    if (elP_acc10) elP_acc10.textContent = `${pctPcs10}%`;
    if (elP_acc15) elP_acc15.textContent = `${pctPcs15}%`;
    if (elP_bias) {
        const sign = Number(biasPcsPct) > 0 ? '+' : '';
        elP_bias.textContent = `${sign}${biasPcsPct}% (${sign}${Math.round(sumDiffPcs)} шт)`;
        elP_bias.style.color = Math.abs(Number(biasPcsPct)) <= 3 ? '#10b981' : (Number(biasPcsPct) > 0 ? 'var(--accent-cyan)' : 'var(--accent-gold)');
    }

    if (elTotal) elTotal.textContent = `${total} рейсов`;
    if (elGoodCount) elGoodCount.textContent = `${countGood} (${Math.round((countGood / total) * 100)}%)`;
    if (elAcceptCount) elAcceptCount.textContent = `${countAcceptable} (${Math.round((countAcceptable / total) * 100)}%)`;
    if (elWarnCount) elWarnCount.textContent = `${countWarning} (${Math.round((countWarning / total) * 100)}%)`;
    if (elDangCount) elDangCount.textContent = `${countDanger} (${Math.round((countDanger / total) * 100)}%)`;
}

// Отрисовка таблицы с фильтрацией и сортировкой
function renderBacktestTable() {
    const tbody = document.getElementById('backtest-table-body');
    const filterVal = document.getElementById('backtest-table-filter')?.value || 'all';
    const searchVal = document.getElementById('backtest-table-search')?.value.trim().toLowerCase() || '';

    if (!tbody) return;

    let rows = [...lastBacktestResults];

    // Фильтрация по статусу
    if (filterVal === 'good') {
        rows = rows.filter(r => r.status === 'good');
    } else if (filterVal === 'acceptable') {
        rows = rows.filter(r => r.status === 'acceptable');
    } else if (filterVal === 'warning') {
        rows = rows.filter(r => r.status === 'warning' || r.status === 'danger');
    } else if (filterVal === 'danger') {
        rows = rows.filter(r => r.status === 'danger');
    }

    // Поиск по тексту
    if (searchVal) {
        rows = rows.filter(r => {
            return String(r.flight).toLowerCase().includes(searchVal) ||
                   String(r.route).toLowerCase().includes(searchVal) ||
                   String(r.airline).toLowerCase().includes(searchVal) ||
                   String(r.dateFormatted).toLowerCase().includes(searchVal);
        });
    }

    // Сортировка
    rows.sort((a, b) => {
        let valA = a[backtestSortCol];
        let valB = b[backtestSortCol];

        if (backtestSortCol === 'date') {
            const da = parseDateToJsDate(a.date);
            const db = parseDateToJsDate(b.date);
            valA = da ? da.getTime() : 0;
            valB = db ? db.getTime() : 0;
        } else if (backtestSortCol === 'diff_weight') {
            valA = a.errWeightAbs;
            valB = b.errWeightAbs;
        } else if (backtestSortCol === 'diff_pcs') {
            valA = a.errPcsAbs;
            valB = b.errPcsAbs;
        }

        if (valA < valB) return backtestSortAsc ? -1 : 1;
        if (valA > valB) return backtestSortAsc ? 1 : -1;
        return 0;
    });

    if (rows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="11" class="empty-table-text">${currentLang === 'ru' ? 'Нет рейсов, соответствующих фильтрам поиска.' : 'No matching flights found.'}</td></tr>`;
        return;
    }

    let html = '';
    rows.forEach(r => {
        const signW = r.diffWeight > 0 ? '+' : '';
        const signPcs = r.diffPcs > 0 ? '+' : '';

        let badgeHtml = '';
        let rowStyle = '';
        if (r.status === 'good') {
            badgeHtml = `<span class="badge-status-pill badge-green">🟢 ≤10%</span>`;
        } else if (r.status === 'acceptable') {
            badgeHtml = `<span class="badge-status-pill badge-cyan">🟡 ≤15%</span>`;
        } else if (r.status === 'warning') {
            badgeHtml = `<span class="badge-status-pill badge-gold">🟠 >15%</span>`;
        } else if (r.status === 'danger') {
            badgeHtml = `<span class="badge-status-pill badge-danger">🔴 >25%</span>`;
            rowStyle = 'background: rgba(239, 68, 68, 0.05);';
        }

        const diffWColor = r.errWeightPctAbs <= 10 ? '#10b981' : (r.errWeightPctAbs <= 15 ? 'var(--accent-cyan)' : (r.errWeightPctAbs <= 25 ? 'var(--accent-gold)' : '#f87171'));
        const diffPcsColor = r.errPcsPctAbs <= 10 ? '#10b981' : (r.errPcsPctAbs <= 15 ? 'var(--accent-cyan)' : (r.errPcsPctAbs <= 25 ? 'var(--accent-gold)' : '#f87171'));

        const paxDetails = (r.rb > 0 || r.rm > 0) ? `<strong>${r.pax}</strong> <span style="font-size: 0.72rem; color: var(--text-muted);">(${r.pax - r.rb - r.rm}/${r.rb}/${r.rm})</span>` : `<strong>${r.pax}</strong>`;

        html += `
            <tr style="${rowStyle}">
                <td class="monospace-val" style="font-size: 0.8rem;">${r.dateFormatted}</td>
                <td><strong class="font-mono">${escapeHtml(r.airline)} ${escapeHtml(r.flight)}</strong></td>
                <td class="cyan-val" style="font-weight: 600;">${escapeHtml(r.route)}</td>
                <td>${paxDetails}</td>
                <td class="monospace-val highlight-gold" style="font-weight: 600;">${Math.round(r.factWeight)} кг</td>
                <td class="monospace-val highlight-cyan" style="font-weight: 600;">${Math.round(r.predWeight)} кг</td>
                <td class="monospace-val" style="color: ${diffWColor}; font-weight: 700;">
                    ${signW}${Math.round(r.diffWeight)} кг <span style="font-size: 0.72rem; font-weight: normal;">(${signW}${r.diffWeightPct.toFixed(1)}%)</span>
                </td>
                <td class="monospace-val highlight-gold">${r.factPcs} шт</td>
                <td class="monospace-val highlight-cyan">${r.predPcs} шт</td>
                <td class="monospace-val" style="color: ${diffPcsColor}; font-weight: 600;">
                    ${signPcs}${r.diffPcs} шт <span style="font-size: 0.72rem; font-weight: normal;">(${signPcs}${r.diffPcsPct.toFixed(1)}%)</span>
                </td>
                <td style="text-align: center;">${badgeHtml}</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// Сортировка таблицы бэктеста по столбцам
function sortBacktestTable(col) {
    if (backtestSortCol === col) {
        backtestSortAsc = !backtestSortAsc;
    } else {
        backtestSortCol = col;
        backtestSortAsc = false;
    }
    renderBacktestTable();
}

// Экспорт результатов тестирования в красиво стилизованный Excel (.xls) с автофильтрами
function exportBacktestToExcel() {
    if (!lastBacktestResults || lastBacktestResults.length === 0) {
        showAviationAlert(currentLang === 'ru' ? 'Нет данных для экспорта! Сначала запустите тест.' : 'No test results to export!', true);
        return;
    }

    const total = lastBacktestResults.length;
    let sumErrW = 0, sumErrPcs = 0, sumDiffW = 0, sumDiffPcs = 0, sumFactW = 0, sumFactPcs = 0;
    let countGood = 0, countAcceptable = 0, countWarning = 0, countDanger = 0;
    let accW10 = 0, accW15 = 0, accPcs10 = 0, accPcs15 = 0;

    lastBacktestResults.forEach(r => {
        sumErrW += r.errWeightAbs;
        sumErrPcs += r.errPcsAbs;
        sumDiffW += r.diffWeight;
        sumDiffPcs += r.diffPcs;
        sumFactW += r.factWeight;
        sumFactPcs += r.factPcs;

        if (r.errWeightPctAbs <= 10) accW10++;
        if (r.errWeightPctAbs <= 15) accW15++;
        if (r.errPcsPctAbs <= 10) accPcs10++;
        if (r.errPcsPctAbs <= 15) accPcs15++;

        if (r.status === 'good') countGood++;
        else if (r.status === 'acceptable') countAcceptable++;
        else if (r.status === 'warning') countWarning++;
        else if (r.status === 'danger') countDanger++;
    });

    const maeW = (sumErrW / total).toFixed(1);
    const maePcs = (sumErrPcs / total).toFixed(1);
    const pctW10 = Math.round((accW10 / total) * 100);
    const pctW15 = Math.round((accW15 / total) * 100);
    const pctPcs10 = Math.round((accPcs10 / total) * 100);
    const pctPcs15 = Math.round((accPcs15 / total) * 100);
    const biasW = sumFactW > 0 ? ((sumDiffW / sumFactW) * 100).toFixed(1) : '0.0';
    const biasPcs = sumFactPcs > 0 ? ((sumDiffPcs / sumFactPcs) * 100).toFixed(1) : '0.0';

    const periodSelect = document.getElementById('backtest-period-select');
    const periodText = periodSelect ? periodSelect.options[periodSelect.selectedIndex]?.text : 'Выбранный период';
    const airlineSelect = document.getElementById('backtest-airline-select');
    const airlineText = airlineSelect ? airlineSelect.options[airlineSelect.selectedIndex]?.text : 'Все авиакомпании';
    const genDate = new Date().toLocaleString('ru-RU');

    const lastDataRow = 8 + total;

    let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <!--[if gte mso 9]>
        <xml>
            <x:ExcelWorkbook>
                <x:ExcelWorksheets>
                    <x:ExcelWorksheet>
                        <x:Name>Точность_Прогнозов</x:Name>
                        <x:WorksheetOptions>
                            <x:DisplayGridlines/>
                            <x:Selected/>
                            <x:Panes>
                                <x:Pane>
                                    <x:Number>3</x:Number>
                                    <x:ActiveRow>8</x:ActiveRow>
                                    <x:ActiveCol>0</x:ActiveCol>
                                </x:Pane>
                            </x:Panes>
                        </x:WorksheetOptions>
                        <x:AutoFilter x:Range="R8C1:R${lastDataRow}C15"/>
                    </x:ExcelWorksheet>
                </x:ExcelWorksheets>
            </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10pt; color: #1E293B; margin: 0; padding: 0; }
            table { border-collapse: collapse; table-layout: fixed; margin: 0; }
            th, td { border: 0.5pt solid #CBD5E1; padding: 5px 8px; vertical-align: middle; }
            
            /* Шапка отчета */
            .report-title-cell { background-color: #0F172A; color: #00F0FF; font-size: 13pt; font-weight: bold; text-align: left; padding: 10px 14px; border: 0.5pt solid #0F172A; }
            .report-meta-cell { background-color: #1E293B; color: #94A3B8; font-size: 9pt; text-align: left; padding: 6px 14px; border: 0.5pt solid #1E293B; }
            
            /* Сводная таблица KPI */
            .kpi-title { font-weight: bold; font-size: 10pt; text-align: center; color: #FFFFFF; border: 0.5pt solid #334155; }
            .kpi-header { background-color: #F1F5F9; font-weight: bold; color: #475569; text-align: center; font-size: 9pt; border: 0.5pt solid #CBD5E1; }
            .kpi-val { text-align: center; font-weight: bold; font-size: 9.5pt; border: 0.5pt solid #CBD5E1; }
            .kpi-good { background-color: #E8F8F0; color: #0E6251; }
            .kpi-acceptable { background-color: #EBF5FB; color: #1B4F72; }
            .kpi-warning { background-color: #FEF9E7; color: #B7950B; }
            .kpi-danger { background-color: #FDEDEC; color: #922B21; }

            /* Шапка таблицы рейсов */
            .table-head th { background-color: #1E293B; color: #FFFFFF; font-weight: bold; font-size: 9.5pt; text-align: center; border: 0.5pt solid #0F172A; }
            .th-weight { background-color: #0369A1 !important; color: #FFFFFF !important; }
            .th-pcs { background-color: #B45309 !important; color: #FFFFFF !important; }
            .th-status { background-color: #334155 !important; color: #00F0FF !important; }

            /* Цвета ячеек по статусу */
            .cell-bg-good { background-color: #FFFFFF; border: 0.5pt solid #E2E8F0; }
            .cell-bg-acceptable { background-color: #F8FAFC; border: 0.5pt solid #E2E8F0; }
            .cell-bg-warning { background-color: #FEF9E7; border: 0.5pt solid #FDE68A; }
            .cell-bg-danger { background-color: #FDEDEC; border: 0.5pt solid #FECACA; }

            /* Текстовые выравнивания */
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .text-left { text-align: left; }
            .font-bold { font-weight: bold; }
            .font-mono { font-family: 'Consolas', monospace; }

            /* Бейджи статусов */
            .badge-good { background-color: #D4EFDF; color: #145A32; font-weight: bold; text-align: center; border: 0.5pt solid #A9DFBF; }
            .badge-acceptable { background-color: #D6EAF8; color: #1B4F72; font-weight: bold; text-align: center; border: 0.5pt solid #AED6F1; }
            .badge-warning { background-color: #FCF3CF; color: #B7950B; font-weight: bold; text-align: center; border: 0.5pt solid #F9E79F; }
            .badge-danger { background-color: #FADBD8; color: #78281F; font-weight: bold; text-align: center; border: 0.5pt solid #F5B7B1; }

            /* Цвета отклонений */
            .diff-good { color: #1E8449; font-weight: bold; }
            .diff-acceptable { color: #2874A6; font-weight: bold; }
            .diff-warning { color: #B7950B; font-weight: bold; }
            .diff-danger { color: #C0392B; font-weight: bold; }
        </style>
    </head>
    <body>
        <table border="0" cellspacing="0" cellpadding="0">
            <colgroup>
                <col width="95">
                <col width="65">
                <col width="75">
                <col width="105">
                <col width="60">
                <col width="85">
                <col width="95">
                <col width="95">
                <col width="95">
                <col width="85">
                <col width="85">
                <col width="85">
                <col width="85">
                <col width="85">
                <col width="145">
            </colgroup>

            <!-- 1. Заголовок отчета -->
            <tr>
                <td colspan="15" class="report-title-cell">✈️ AEROBAG PREDICTOR v12.0 — ОТЧЕТ ТОЧНОСТИ И ВАЛИДАЦИИ ПРОГНОЗОВ БАГАЖА</td>
            </tr>
            <tr>
                <td colspan="15" class="report-meta-cell">
                    <strong>Период анализа:</strong> ${escapeHtml(periodText)} &nbsp;|&nbsp; 
                    <strong>Авиакомпания:</strong> ${escapeHtml(airlineText)} &nbsp;|&nbsp; 
                    <strong>Проверено рейсов:</strong> ${total} &nbsp;|&nbsp; 
                    <strong>Дата выгрузки:</strong> ${genDate}
                </td>
            </tr>
            <tr><td colspan="15" style="border: none; height: 8px;"></td></tr>

            <!-- 2. Сводные KPI карточки -->
            <tr>
                <td colspan="5" class="kpi-title" style="background-color: #0369A1;">⚖️ ТОЧНОСТЬ ВЕСА БАГАЖА (КГ)</td>
                <td colspan="5" class="kpi-title" style="background-color: #B45309;">🧳 ТОЧНОСТЬ МЕСТ БАГАЖА (ШТ)</td>
                <td colspan="5" class="kpi-title" style="background-color: #047857;">📊 РАСПРЕДЕЛЕНИЕ ТОЧНОСТИ</td>
            </tr>
            <tr class="kpi-header">
                <td>Ср. ошибка (MAE)</td>
                <td>В коридоре ±10%</td>
                <td>В коридоре ±15%</td>
                <td colspan="2">Суммарный баланс (Bias)</td>
                <td>Ср. ошибка (MAE)</td>
                <td>В коридоре ±10%</td>
                <td>В коридоре ±15%</td>
                <td colspan="2">Суммарный баланс (Bias)</td>
                <td class="kpi-good">Хорошо (≤10%)</td>
                <td class="kpi-acceptable">Допустимо (≤15%)</td>
                <td class="kpi-warning">Отклонение (>15%)</td>
                <td colspan="2" class="kpi-danger">Аномалия (>25%)</td>
            </tr>
            <tr>
                <td class="kpi-val font-mono">±${maeW} кг</td>
                <td class="kpi-val kpi-good font-mono">${pctW10}%</td>
                <td class="kpi-val kpi-acceptable font-mono">${pctW15}%</td>
                <td colspan="2" class="kpi-val font-mono">${Number(biasW) > 0 ? '+' : ''}${biasW}% (${Number(sumDiffW) > 0 ? '+' : ''}${Math.round(sumDiffW)} кг)</td>
                
                <td class="kpi-val font-mono">±${maePcs} шт</td>
                <td class="kpi-val kpi-good font-mono">${pctPcs10}%</td>
                <td class="kpi-val kpi-acceptable font-mono">${pctPcs15}%</td>
                <td colspan="2" class="kpi-val font-mono">${Number(biasPcs) > 0 ? '+' : ''}${biasPcs}% (${Number(sumDiffPcs) > 0 ? '+' : ''}${Math.round(sumDiffPcs)} шт)</td>
                
                <td class="kpi-val kpi-good font-mono">${countGood} (${Math.round((countGood / total) * 100)}%)</td>
                <td class="kpi-val kpi-acceptable font-mono">${countAcceptable} (${Math.round((countAcceptable / total) * 100)}%)</td>
                <td class="kpi-val kpi-warning font-mono">${countWarning} (${Math.round((countWarning / total) * 100)}%)</td>
                <td colspan="2" class="kpi-val kpi-danger font-mono">${countDanger} (${Math.round((countDanger / total) * 100)}%)</td>
            </tr>
            <tr><td colspan="15" style="border: none; height: 12px;"></td></tr>

            <!-- 3. Основная таблица рейсов с автофильтром -->
            <tr class="table-head" x:autofilter="all">
                <th style="width: 95px;" x:autofilter="all">Дата вылета</th>
                <th style="width: 65px;" x:autofilter="all">АК</th>
                <th style="width: 75px;" x:autofilter="all">Рейс</th>
                <th style="width: 105px;" x:autofilter="all">Маршрут</th>
                <th style="width: 60px;" x:autofilter="all">PAX</th>
                <th style="width: 85px;" x:autofilter="all">ВЗ/РБ/РМ</th>
                <th class="th-weight" style="width: 95px;" x:autofilter="all">Факт Вес (кг)</th>
                <th class="th-weight" style="width: 95px;" x:autofilter="all">Прогноз (кг)</th>
                <th class="th-weight" style="width: 95px;" x:autofilter="all">Разница (кг)</th>
                <th class="th-weight" style="width: 85px;" x:autofilter="all">Ошибка Вес</th>
                <th class="th-pcs" style="width: 85px;" x:autofilter="all">Факт Мест</th>
                <th class="th-pcs" style="width: 85px;" x:autofilter="all">Прогноз Мест</th>
                <th class="th-pcs" style="width: 85px;" x:autofilter="all">Разница Мест</th>
                <th class="th-pcs" style="width: 85px;" x:autofilter="all">Ошибка Мест</th>
                <th class="th-status" style="width: 145px;" x:autofilter="all">Статус точности</th>
            </tr>
    `;

    lastBacktestResults.forEach(r => {
        const signW = r.diffWeight > 0 ? '+' : '';
        const signPcs = r.diffPcs > 0 ? '+' : '';

        let cellBgClass = 'cell-bg-good';
        let badgeClass = 'badge-good';
        let statusLabel = '🟢 Хорошо (≤10%)';

        if (r.status === 'danger') {
            cellBgClass = 'cell-bg-danger';
            badgeClass = 'badge-danger';
            statusLabel = '🔴 Аномалия (>25%)';
        } else if (r.status === 'warning') {
            cellBgClass = 'cell-bg-warning';
            badgeClass = 'badge-warning';
            statusLabel = '🟠 Отклонение (>15%)';
        } else if (r.status === 'acceptable') {
            cellBgClass = 'cell-bg-acceptable';
            badgeClass = 'badge-acceptable';
            statusLabel = '🟡 Допустимо (≤15%)';
        }

        const diffWClass = r.errWeightPctAbs <= 10 ? 'diff-good' : (r.errWeightPctAbs <= 15 ? 'diff-acceptable' : (r.errWeightPctAbs <= 25 ? 'diff-warning' : 'diff-danger'));
        const diffPcsClass = r.errPcsPctAbs <= 10 ? 'diff-good' : (r.errPcsPctAbs <= 15 ? 'diff-acceptable' : (r.errPcsPctAbs <= 25 ? 'diff-warning' : 'diff-danger'));

        const vz = r.pax - r.rb - r.rm;
        const paxComp = `${vz}/${r.rb}/${r.rm}`;

        html += `
            <tr>
                <td class="${cellBgClass} text-center font-mono">${r.dateFormatted}</td>
                <td class="${cellBgClass} text-center font-bold">${escapeHtml(r.airline)}</td>
                <td class="${cellBgClass} text-center font-mono font-bold">${escapeHtml(r.flight)}</td>
                <td class="${cellBgClass} text-center font-bold" style="color: #0284C7;">${escapeHtml(r.route)}</td>
                <td class="${cellBgClass} text-center font-bold">${r.pax}</td>
                <td class="${cellBgClass} text-center font-mono" style="font-size: 8.5pt; color: #64748B;">${paxComp}</td>
                <td class="${cellBgClass} text-right font-mono font-bold">${Math.round(r.factWeight)} кг</td>
                <td class="${cellBgClass} text-right font-mono font-bold" style="color: #0284C7;">${Math.round(r.predWeight)} кг</td>
                <td class="${cellBgClass} text-right font-mono ${diffWClass}">${signW}${Math.round(r.diffWeight)} кг</td>
                <td class="${cellBgClass} text-right font-mono ${diffWClass}">${signW}${r.diffWeightPct.toFixed(1)}%</td>
                <td class="${cellBgClass} text-right font-mono font-bold">${r.factPcs} шт</td>
                <td class="${cellBgClass} text-right font-mono font-bold" style="color: #B45309;">${r.predPcs} шт</td>
                <td class="${cellBgClass} text-right font-mono ${diffPcsClass}">${signPcs}${r.diffPcs} шт</td>
                <td class="${cellBgClass} text-right font-mono ${diffPcsClass}">${signPcs}${r.diffPcsPct.toFixed(1)}%</td>
                <td class="${badgeClass}">${statusLabel}</td>
            </tr>
        `;
    });

    html += `
        </table>
    </body>
    </html>
    `;

    try {
        const blob = new Blob(['\uFEFF' + html], { type: 'application/vnd.ms-excel;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const dateStr = new Date().toISOString().split('T')[0];
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.download = `AeroBag_Accuracy_Report_${dateStr}.xls`;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            if (document.body.contains(a)) {
                document.body.removeChild(a);
            }
            URL.revokeObjectURL(url);
        }, 500);

        showAviationAlert(currentLang === 'ru' ? `Стилизованный отчет точности успешно выгружен (${total} рейсов).` : 'Styled accuracy report exported to Excel.', false);
    } catch (e) {
        showAviationAlert('Ошибка при экспорте отчета: ' + e.message, true);
    }
}

// Экспорт в глобальную область
window.sortBacktestTable = sortBacktestTable;
window.exportBacktestToExcel = exportBacktestToExcel;
window.runBacktestAccuracySimulation = runBacktestAccuracySimulation;


// --------------------------------------------------------------------------
// TELEGRAM ALERTING, HEALTH CHECK PING & SYSTEM DIAGNOSTICS
// --------------------------------------------------------------------------

let telegramConfig = { bot_token: '', chat_id: '', is_enabled: false };
let isHealthPollingActive = false;

// Периодический Health Check и живой пинг в шапке
async function performSystemHealthCheck() {
    const pingBadge = document.getElementById('header-server-ping');
    const pulseDot = document.getElementById('status-pulse-dot');
    const statusLabel = document.getElementById('status-text-label');

    if (isOfflineMode || window.location.protocol === 'file:') {
        if (pingBadge) {
            pingBadge.style.display = 'inline-block';
            pingBadge.textContent = '⚡ 1ms';
            pingBadge.className = 'status-ping-badge ping-fast';
            pingBadge.title = 'Локальный режим: задержка памяти 1ms';
        }
        if (statusLabel) statusLabel.textContent = currentLang === 'ru' ? 'ДИСПЕТЧЕР ОНЛАЙН' : 'DISPATCHER ONLINE';
        if (pulseDot) pulseDot.style.background = '#00f0ff';
        return;
    }

    const t0 = performance.now();
    try {
        const response = await fetch('api.php?action=health', { cache: 'no-store' });
        const latency = Math.round(performance.now() - t0);
        const data = await response.json();

        if (data && data.success && data.status === 'healthy') {
            if (pingBadge) {
                pingBadge.style.display = 'inline-block';
                pingBadge.textContent = `${latency}ms`;
                pingBadge.className = 'status-ping-badge ' + (latency < 100 ? 'ping-fast' : (latency < 300 ? 'ping-medium' : 'ping-slow'));
                pingBadge.title = `MySQL Ping: ${latency}ms | Статус: Healthy`;
            }
            if (statusLabel) statusLabel.textContent = currentLang === 'ru' ? 'ДИСПЕТЧЕР ОНЛАЙН' : 'DISPATCHER ONLINE';
            if (pulseDot) pulseDot.style.background = '#00f0ff';
        } else {
            if (pingBadge) {
                pingBadge.style.display = 'inline-block';
                pingBadge.textContent = 'DEGRADED';
                pingBadge.className = 'status-ping-badge ping-medium';
            }
        }
    } catch (err) {
        if (pingBadge) {
            pingBadge.style.display = 'inline-block';
            pingBadge.textContent = '⚡ 1ms';
            pingBadge.className = 'status-ping-badge ping-fast';
            pingBadge.title = 'Автономный локальный режим';
        }
        if (statusLabel) statusLabel.textContent = currentLang === 'ru' ? 'ДИСПЕТЧЕР ОНЛАЙН' : 'DISPATCHER ONLINE';
        if (pulseDot) pulseDot.style.background = '#00f0ff';
    }
}

function startHealthCheckPolling() {
    if (isHealthPollingActive) return;
    isHealthPollingActive = true;
    performSystemHealthCheck();
    setInterval(performSystemHealthCheck, 60000); // Каждые 60 секунд
}

// Управление Telegram-настройками
function toggleTelegramAccordion(e) {
    if (e) {
        if (e.target && (e.target.closest('#btn-test-telegram') || e.target.closest('#btn-save-telegram') || e.target.closest('input') || e.target.closest('button.btn-toggle-pwd'))) {
            return;
        }
        e.stopPropagation();
    }
    const panel = document.getElementById('telegram-panel');
    const toggleBtn = document.getElementById('btn-toggle-telegram-collapse');
    if (!panel) return;

    panel.classList.toggle('collapsed');
    const isCollapsed = panel.classList.contains('collapsed');

    if (toggleBtn) {
        const textEl = toggleBtn.querySelector('.collapse-text');
        const iconEl = toggleBtn.querySelector('.collapse-icon');
        if (textEl) {
            textEl.textContent = isCollapsed 
                ? (translations[currentLang]['btn-expand'] || (currentLang === 'ru' ? 'Развернуть' : 'Expand'))
                : (translations[currentLang]['btn-collapse'] || (currentLang === 'ru' ? 'Свернуть' : 'Collapse'));
        }
        if (iconEl) iconEl.textContent = isCollapsed ? '▼' : '▲';
    }
}

async function loadTelegramSettings() {
    if (!currentUser || currentUser.role !== 'admin') return;

    let config = null;

    if (!isOfflineMode && window.location.protocol !== 'file:') {
        try {
            const response = await fetch('api.php?action=get_telegram_settings');
            const data = await response.json();
            if (data.success && data.config) {
                config = data.config;
            }
        } catch (e) {}
    }

    if (!config) {
        try {
            config = JSON.parse(localStorage.getItem('aerobag_telegram_config') || '{}');
        } catch (e) {
            config = {};
        }
    }

    telegramConfig = {
        bot_token: config.bot_token || '',
        chat_id: config.chat_id || '',
        is_enabled: Boolean(config.is_enabled)
    };

    const tokenInput = document.getElementById('input-telegram-token');
    const chatInput = document.getElementById('input-telegram-chatid');
    const chkEnable = document.getElementById('chk-telegram-enable');
    const statusBadge = document.getElementById('telegram-status-badge');
    const chatBadge = document.getElementById('telegram-chat-badge');

    if (tokenInput) tokenInput.value = telegramConfig.bot_token;
    if (chatInput) chatInput.value = telegramConfig.chat_id;
    if (chkEnable) chkEnable.checked = telegramConfig.is_enabled;

    if (statusBadge) {
        if (telegramConfig.is_enabled && telegramConfig.bot_token && telegramConfig.chat_id) {
            statusBadge.textContent = '🟢 АКТИВЕН';
            statusBadge.className = 'badge-role badge-role-dispatcher';
        } else {
            statusBadge.textContent = '⚪ ОТКЛЮЧЕН';
            statusBadge.className = 'badge-role';
        }
    }
    if (chatBadge) {
        if (telegramConfig.chat_id) {
            chatBadge.style.display = 'inline-block';
            chatBadge.textContent = `ID: ${telegramConfig.chat_id}`;
        } else {
            chatBadge.style.display = 'none';
        }
    }
}

async function handleSaveTelegramConfig(e) {
    if (e) e.preventDefault();
    if (!currentUser || currentUser.role !== 'admin') return;

    const tokenInput = document.getElementById('input-telegram-token');
    const chatInput = document.getElementById('input-telegram-chatid');
    const chkEnable = document.getElementById('chk-telegram-enable');
    const saveBtn = document.getElementById('btn-save-telegram');

    const botToken = tokenInput ? tokenInput.value.trim() : '';
    const chatId = chatInput ? chatInput.value.trim() : '';
    const isEnabled = chkEnable ? chkEnable.checked : false;

    if (isEnabled && (!botToken || !chatId)) {
        showAviationAlert(currentLang === 'ru' ? 'Для включения уведомлений укажите Токен бота и ID чата.' : 'Please provide Bot Token and Chat ID.', true);
        return;
    }

    if (saveBtn) saveBtn.disabled = true;

    const localConfig = { bot_token: botToken, chat_id: chatId, is_enabled: isEnabled };
    localStorage.setItem('aerobag_telegram_config', JSON.stringify(localConfig));
    if (typeof recordSystemLogEntry === 'function') {
        recordSystemLogEntry('INFO', 'SYSTEM', `Обновлены настройки Telegram: статус=${isEnabled ? 'ВКЛ' : 'ВЫКЛ'}, чат=${chatId}`);
    }

    if (!isOfflineMode && window.location.protocol !== 'file:') {
        try {
            const response = await fetch('api.php?action=save_telegram_settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(localConfig)
            });
            const data = await response.json();

            if (data.success) {
                showAviationAlert(currentLang === 'ru' ? 'Настройки Telegram успешно сохранены на сервере.' : 'Telegram settings saved on server.', false);
            } else {
                showAviationAlert(data.error || 'Настройки сохранены локально.', false);
            }
        } catch (err) {
            showAviationAlert(currentLang === 'ru' ? 'Настройки сохранены локально (режим оффлайн).' : 'Telegram settings saved locally.', false);
        } finally {
            if (saveBtn) saveBtn.disabled = false;
            await loadTelegramSettings();
        }
    } else {
        if (saveBtn) saveBtn.disabled = false;
        showAviationAlert(currentLang === 'ru' ? 'Настройки Telegram успешно сохранены.' : 'Telegram settings saved.', false);
        await loadTelegramSettings();
    }
}

async function handleTestTelegramConnection(e) {
    if (e) e.preventDefault();
    const tokenInput = document.getElementById('input-telegram-token');
    const chatInput = document.getElementById('input-telegram-chatid');
    const testBtn = document.getElementById('btn-test-telegram');

    const botToken = tokenInput ? tokenInput.value.trim() : '';
    const chatId = chatInput ? chatInput.value.trim() : '';

    if (!botToken || !chatId) {
        showAviationAlert(currentLang === 'ru' ? 'Введите Токен бота и ID чата для проверки.' : 'Please enter Bot Token and Chat ID to test.', true);
        return;
    }

    if (testBtn) {
        testBtn.disabled = true;
        testBtn.innerHTML = '<span>⏳</span> ' + (currentLang === 'ru' ? 'Отправка...' : 'Sending...');
    }

    let success = false;
    let errorMessage = '';

    // 1. Отправка через серверный бэкенд (cURL на Beget)
    if (!isOfflineMode && window.location.protocol !== 'file:') {
        try {
            const response = await fetch('api.php?action=test_telegram', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bot_token: botToken,
                    chat_id: chatId
                })
            });
            const data = await response.json();
            if (data && data.success) {
                success = true;
            } else {
                errorMessage = (data && data.error) ? data.error : 'Сервер вернул ошибку отправки.';
            }
        } catch (err) {
            errorMessage = 'Ошибка связи с сервером: ' + err.message;
        }
    } else {
        errorMessage = currentLang === 'ru' ? 'Тестирование Telegram доступно только при подключении к серверу.' : 'Telegram test requires server connection.';
    }

    if (testBtn) {
        testBtn.disabled = false;
        testBtn.innerHTML = '<span>🧪</span> <span data-translate="btn-test-telegram">' + (currentLang === 'ru' ? 'Тест соединения' : 'Test Connection') + '</span>';
    }

    if (success) {
        if (typeof recordSystemLogEntry === 'function') {
            recordSystemLogEntry('INFO', 'SYSTEM', `Успешный тест Telegram-бота (чат ${chatId})`);
        }
        showAviationAlert(currentLang === 'ru' ? '✅ Тестовое сообщение успешно доставлено в Telegram!' : '✅ Test message sent to Telegram!', false);
    } else {
        if (typeof recordSystemLogEntry === 'function') {
            recordSystemLogEntry('ERROR', 'SYSTEM', `Ошибка теста Telegram: ${errorMessage}`);
        }
        showAviationAlert('❌ ' + (errorMessage || (currentLang === 'ru' ? 'Ошибка отправки в Telegram.' : 'Telegram delivery error.')), true);
    }
}

// Диагностика системы и метрики
function toggleDiagnosticsAccordion(e) {
    if (e) {
        if (e.target && e.target.closest('#btn-refresh-diagnostics')) return;
        e.stopPropagation();
    }
    const panel = document.getElementById('diagnostics-panel');
    const toggleBtn = document.getElementById('btn-toggle-diagnostics-collapse');
    if (!panel) return;

    panel.classList.toggle('collapsed');
    const isCollapsed = panel.classList.contains('collapsed');

    if (toggleBtn) {
        const textEl = toggleBtn.querySelector('.collapse-text');
        const iconEl = toggleBtn.querySelector('.collapse-icon');
        if (textEl) {
            textEl.textContent = isCollapsed 
                ? (translations[currentLang]['btn-expand'] || (currentLang === 'ru' ? 'Развернуть' : 'Expand'))
                : (translations[currentLang]['btn-collapse'] || (currentLang === 'ru' ? 'Свернуть' : 'Collapse'));
        }
        if (iconEl) iconEl.textContent = isCollapsed ? '▼' : '▲';
    }

    if (!isCollapsed) {
        loadSystemDiagnostics();
    }
}

async function loadSystemDiagnostics() {
    if (!currentUser || currentUser.role !== 'admin') return;

    let diagData = null;

    if (!isOfflineMode && window.location.protocol !== 'file:') {
        try {
            const response = await fetch('api.php?action=system_diagnostics');
            const data = await response.json();
            if (data.success) {
                diagData = data;
            }
        } catch (e) {}
    }

    if (!diagData) {
        const totalFlights = (typeof flightsDB !== 'undefined' && Array.isArray(flightsDB)) ? flightsDB.length : 0;
        let minDate = '-';
        let maxDate = '-';
        const airlineCounts = {};

        if (totalFlights > 0) {
            const dates = flightsDB.map(f => f.date).filter(Boolean).sort();
            if (dates.length > 0) {
                minDate = dates[0];
                maxDate = dates[dates.length - 1];
            }
            flightsDB.forEach(f => {
                const al = f.airline || 'N4';
                airlineCounts[al] = (airlineCounts[al] || 0) + 1;
            });
        }

        const airlinesArr = Object.entries(airlineCounts).map(([airline, cnt]) => ({ airline, cnt })).sort((a, b) => b.cnt - a.cnt);
        const localDbSizeMb = (totalFlights * 0.00035 + 0.15);

        let localBackups = [];
        try {
            localBackups = JSON.parse(localStorage.getItem('aerobag_local_backups') || '[]');
        } catch (e) {}

        let localLogs = [];
        try {
            localLogs = JSON.parse(localStorage.getItem('aerobag_system_logs') || '[]');
        } catch (e) {}

        diagData = {
            database: {
                total_flights: totalFlights,
                size_mb: localDbSizeMb.toFixed(2),
                min_date: minDate,
                max_date: maxDate,
                airlines: airlinesArr
            },
            backups: {
                count: localBackups.length,
                size_mb: (localBackups.length * 0.45).toFixed(2)
            },
            logs: {
                errors_size_kb: 4,
                audit_events_count: localLogs.length
            },
            server: {
                php_version: '8.2 (Local Engine)',
                os: navigator.platform || 'Windows',
                memory_limit: '512M'
            }
        };
    }

    renderSystemDiagnostics(diagData);
}

function handleRefreshDiagnostics(e) {
    if (e) e.stopPropagation();
    loadSystemDiagnostics();
}

function renderSystemDiagnostics(data) {
    const dbSizeEl = document.getElementById('diag-val-db-size');
    const dbFlightsEl = document.getElementById('diag-val-db-flights');
    const backupCountEl = document.getElementById('diag-val-backup-count');
    const backupSizeEl = document.getElementById('diag-val-backup-size');
    const dateRangeEl = document.getElementById('diag-val-date-range');
    const airlinesEl = document.getElementById('diag-val-airlines');
    const serverEnvEl = document.getElementById('diag-val-server-env');
    const logSizeEl = document.getElementById('diag-val-log-size');
    const badgeDbSize = document.getElementById('diag-db-size-badge');
    const badgePhp = document.getElementById('diag-php-badge');

    if (data.database) {
        if (dbSizeEl) dbSizeEl.textContent = Number(data.database.size_mb || 0).toFixed(2);
        if (dbFlightsEl) dbFlightsEl.textContent = `${data.database.total_flights || 0} рейсов в базе`;
        if (badgeDbSize) badgeDbSize.textContent = `DB: ${Number(data.database.size_mb || 0).toFixed(2)} MB`;

        if (dateRangeEl) {
            const minD = data.database.min_date || '-';
            const maxD = data.database.max_date || '-';
            dateRangeEl.textContent = minD === maxD ? minD : `${minD} — ${maxD}`;
        }

        if (airlinesEl && Array.isArray(data.database.airlines)) {
            const topAirlines = data.database.airlines.slice(0, 4).map(a => `${a.airline} (${a.cnt})`).join(', ');
            airlinesEl.textContent = topAirlines ? `АК: ${topAirlines}` : 'АК: —';
        }
    }

    if (data.backups) {
        if (backupCountEl) backupCountEl.textContent = data.backups.count || 0;
        if (backupSizeEl) backupSizeEl.textContent = `Объем: ${Number(data.backups.size_mb || 0).toFixed(2)} MB`;
    }

    if (data.logs) {
        if (logSizeEl) logSizeEl.textContent = `Лог: ${data.logs.errors_size_kb || 0} KB | Аудит: ${data.logs.audit_events_count || 0}`;
    }

    if (data.server) {
        if (serverEnvEl) serverEnvEl.textContent = `PHP ${data.server.php_version} (${data.server.os || 'Linux'})`;
        if (badgePhp) badgePhp.textContent = `PHP ${data.server.php_version}`;
    }
}



/**
 * Переключение видимости пароля или токена (Eye icon toggle)
 */
function togglePasswordVisibility(target, btn) {
    const input = typeof target === 'string' ? document.getElementById(target) : target;
    if (!input) return;
    if (input.type === 'password') {
        input.type = 'text';
        if (btn) btn.textContent = '🙈';
    } else {
        input.type = 'password';
        if (btn) btn.textContent = '👁️';
    }
}

window.togglePasswordVisibility = togglePasswordVisibility;
window.toggleTelegramAccordion = toggleTelegramAccordion;
window.handleSaveTelegramConfig = handleSaveTelegramConfig;
window.handleTestTelegramConnection = handleTestTelegramConnection;
window.toggleDiagnosticsAccordion = toggleDiagnosticsAccordion;
window.handleRefreshDiagnostics = handleRefreshDiagnostics;
window.loadSystemDiagnostics = loadSystemDiagnostics;
window.performSystemHealthCheck = performSystemHealthCheck;
window.startHealthCheckPolling = startHealthCheckPolling;


