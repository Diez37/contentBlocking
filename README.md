# Сontent Block
[![Donations Badge](https://yourdonation.rocks/images/badge.svg)](https://yasobe.ru/na/donat_blokirovwik_kontenta)

    Скрипт блокировки, запросов и встраиваемого контента, от плагинов, 
    на подобие Яндекс.Маркет 

#### Установка

* npm
```bash
npm i c-block
```

* yarn
```bash
yarn add c-block
```

#### Начало работы
* импортируйте класс

```javascript
import ContentBlock from 'c-block';
```
      
* настройте и запустите
```javascript
ContentBlock.create({
        'urls': ['.*sovetnik.*yandex.*','.*yastatic.*sovetnik.*'],
        'keywords': ['(Более выгодная цена)|(Посмотреть)|(Еще предложения)|(Советник)|(Яндекс)'],
      }).run();
```
#### Параметры конфигурации
* urls - регулярные выражения, для блокировки запросов.
* keywords - ключевые слова, по которым происходит поиск елементов, для блока.
* document.margin.top - верхний отсуп страницы, к которому будет происходить возврат, если плагин его  меняет, по умолчанию `0px`