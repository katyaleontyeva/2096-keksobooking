'use strict';

var NOTICES_NUM = 8;

var OFFER_AVATARS = generateAvatarLinks(NOTICES_NUM);

var OFFER_TITLES = [
  'Большая уютная квартира',
  'Маленькая неуютная квартира',
  'Огромный прекрасный дворец',
  'Маленький ужасный дворец',
  'Красивый гостевой домик',
  'Некрасивый негостеприимный домик',
  'Уютное бунгало далеко от моря',
  'Неуютное бунгало по колено в воде'
];

var OFFER_TYPE = ['flat', 'house', 'bungalo'];

var OFFER_CHECKIN = ['12:00', '13:00', '14:00'];

var OFFER_CHECKOUT = ['12:00', '13:00', '14:00'];

var OFFER_FEATURES = [
  'wifi',
  'dishwasher',
  'parking',
  'washer',
  'elevator',
  'conditioner'
];

var OFFER_PHOTOS = [
  'http://o0.github.io/assets/images/tokyo/hotel1.jpg',
  'http://o0.github.io/assets/images/tokyo/hotel2.jpg',
  'http://o0.github.io/assets/images/tokyo/hotel3.jpg'
];

var MIN_PRICE = 1000;
var MAX_PRICE = 1000000;
var MIN_ROOMS = 1;
var MAX_ROOMS = 5;
var MIN_GUESTS = 1;
var MAX_GUESTS = MAX_ROOMS * 3;
var MIN_X = 300;
var MAX_X = 900;
var MIN_Y = 150;
var MAX_Y = 500;

var PIN_WIDTH = 50;
var PIN_HEIGHT = 70;

var MAP_ELEMENT = document.querySelector('.map');
var MAP_PINS_ELEMENT = MAP_ELEMENT.querySelector('.map__pins');
var MAP_FILTERS_ELEMENT = MAP_ELEMENT.querySelector('.map__filters-container');

// Шаблон
var TEMPLATE = document.querySelector('template').content;

// Шаблон метки
var PIN_TEMPLATE = TEMPLATE.querySelector('.map__pin');

// Шаблон объявления
var CARD_TEMPLATE = TEMPLATE.querySelector('article.map__card');

/**
 * Создает массив, состоящий из случайно сгенерированных объектов,
 * которые описывают объявления неподалёку
 *
 * @param {number} noticesNum Количество объявлений.
 * @param {object} noticesOptions Возможные параметры объявлений.
 * @return {array} noticesData Массив объектов с обявлениями.
 */

function generateNotices(noticesNum, noticesOptions) {
  var noticesData = [];

  for (var i = 0; i < noticesNum; i++) {
    var newNotice = generateRandomNotice(noticesOptions);
    noticesData.push(newNotice);
  }

  return noticesData;
}

/**
 * Создает случайное объявление
 *
 * @param {object} options Возможные параметры объявления.
 * @return {object} notice Итоговое объявление.
 */
function generateRandomNotice(options) {
  var locationX = getRandomInt(options.locationXMin, options.locationXMax);
  var locationY = getRandomInt(options.locationYMin, options.locationYMax);

  var notice = {
    'author': {
      'avatar': getRandomElementUnique(options.authorAvatars)
    },

    'offer': {
      'title': getRandomElementUnique(options.offerTitles),
      'address': locationX + ', ' + locationY,
      'price': getRandomInt(options.priceMin, options.priceMax),
      'type': getRandomElement(options.offerType),
      'rooms': getRandomInt(options.roomsMin, options.roomsMax),
      'guests': getRandomInt(options.guestsMin, options.guestsMax),
      'checkin': getRandomElement(options.offerCheckIn),
      'checkout': getRandomElement(options.offerCheckOut),
      'features': options.offerFeatures,
      'description': '',
      'photos': shuffleArray(options.offerPhotos)
    },

    'location': {
      'x': locationX,
      'y': locationY
    }
  };

  console.log(notice);
  return notice;
}

/**
 * Вставляет метки в DOM
 *
 * @param {array} pinsData Массив с данными для меток.
 * @param {Node} pinsElement Элемент, куда вставляются метки.
 */
function renderPins(pinsData, pinsElement) {
  var fragment = document.createDocumentFragment();

  for (var i = 0; i < pinsData.length; i++) {
    fragment.appendChild(renderPin(pinsData[i], PIN_TEMPLATE, PIN_WIDTH, PIN_HEIGHT));
  }

  pinsElement.appendChild(fragment);
}

/**
 * Создает метку по шаблону
 *
 * @param {object} pinData Данные для метки.
 * @param {Node} pinTemplate Шаблон метки.
 * @param {number} pinWidth Ширина метки.
 * @param {number} pinHeight Высота метки.
 * @return {Node} pinElement DOM элемент.
 */
function renderPin(pinData, pinTemplate, pinWidth, pinHeight) {
  var pinElement = pinTemplate.cloneNode(true);

  pinElement.style.left = (pinData.location.x - pinWidth / 2) + 'px';
  pinElement.style.top = (pinData.location.y - pinHeight) + 'px';

  pinElement.querySelector('img').setAttribute('src', pinData.author.avatar);

  return pinElement;
}

/**
 * Создает объявление по шаблону и вставляет в DOM
 *
 * @param {object} cardData Данные для объявления.
 * @param {Node} cardTemplate Шаблон карточки объявления.
 * @param {Node} insertToElement Элемент, в который вставляется карточка.
 * @param {Node} insertBeforeElement Элемент, перед которым вставляется карточка.
 */
function renderCard(cardData, cardTemplate, insertToElement, insertBeforeElement) {
  var fragment = document.createDocumentFragment();
  var cardElement = cardTemplate.cloneNode(true);

  var cardAvatar = cardElement.querySelector('.popup__avatar');
  cardAvatar.setAttribute('src', cardData.author.avatar);

  var cardTitle = cardElement.querySelector('h3');
  cardTitle.textContent = cardData.offer.title;

  var cardAddress = cardTitle.nextElementSibling.querySelector('small');
  cardAddress.textContent = cardData.offer.address;

  var cardPrice = cardElement.querySelector('.popup__price');
  cardPrice.textContent = cardData.offer.price + '\u20BD\/ночь';

  var cardType = cardElement.querySelector('h4');
  cardType.textContent = getOfferTypeName(cardData.offer.type);

  var cardRoomsGuests = cardType.nextElementSibling;
  cardRoomsGuests.textContent = cardData.offer.rooms + ' комнаты для ' + cardData.offer.guests + ' гостей';

  var cardCheckinCheckout = cardRoomsGuests.nextElementSibling;
  cardCheckinCheckout.textContent = 'Заезд после ' + cardData.offer.checkin + ', выезд до ' + cardData.offer.checkout;

  var cardFeaturesList = cardElement.querySelector('.popup__features');
  // TODO

  var cardDescription = cardFeaturesList.nextElementSibling;
  cardDescription.textContent = cardData.offer.description;

  var cardPicturesList = cardElement.querySelector('.popup__pictures');
  var cardPictureWrapper = cardPicturesList.querySelector('li');
  for (var i = 0; i < cardData.offer.photos.length; i++) {
    cardPictureWrapper.cloneNode(true);
  }

  fragment.appendChild(cardElement);
  insertToElement.insertBefore(fragment, insertBeforeElement);
}

/**
 * Возвращает случайное целое число между min и max (включая оба)
 *
 * @param {number} min Минимальное значение.
 * @param {number} max Максимальное значение.
 * @return {number} Случайное число.
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Возвращает случайный элемент из массива
 *
 * @param {array} arr Массив для поиска элемента.
 * @return {string} Случайный элемент массива.
 */
function getRandomElement(arr) {
  return arr[getRandomInt(0, arr.length - 1)];
}

/**
 * Удаляет случайный элемент из массива
 * и возвращает его
 *
 * @param {array} arr Массив для поиска элемента.
 * @return {string} el Случайный элемент массива.
 */
function getRandomElementUnique(arr) {
  var removedEl = arr.splice(getRandomInt(0, arr.length - 1), 1);
  return removedEl[0];
}

/**
 * Перемешивает элементы массива в случайном порядке
 *
 * @param {array} arr Массив, который нужно перемешать.
 * @return {array} arr Итоговый массив.
 */
function shuffleArray(arr) {
  var currentIndex = arr.length;
  var temporaryValue;
  var randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = arr[currentIndex];
    arr[currentIndex] = arr[randomIndex];
    arr[randomIndex] = temporaryValue;
  }

  return arr;
}

/**
 * Добавляет 0 перед числом меньше заданной длины
 *
 * @param {number} number Число, перед которым нужно добавить 0.
 * @param {number} length Минимальная длина строки, включая ведущие нули.
 * @return {string} str Итоговая строка.
 */
function leadingZeroes(number, length) {
  var str = '' + number;

  while (str.length < length) {
    str = '0' + str;
  }

  return str;
}

/**
 * Создает массив строк с адресами изображений аватаров
 *
 * @param {number} num Длина массива.
 * @return {array} links Итоговый массив.
 */
function generateAvatarLinks(num) {
  var links = [];

  for (var i = 1; i <= num; i++) {
    var link = 'img/avatars/user' + leadingZeroes(i, 2) + '.png';
    links.push(link);
  }

  return links;
}

/**
 * Возвращает название типа жилья на русском языке
 *
 * @param {string} type Тип жилья.
 * @return {string} Название типа жилья.
 */
function getOfferTypeName(type) {
  var names = {
    'flat': 'Квартира',
    'house': 'Дом',
    'bungalo': 'Бунгало'
  };

  return names[type];
}

// Генерируем объявления
var notices = generateNotices(NOTICES_NUM, {
  authorAvatars: OFFER_AVATARS,
  offerTitles: OFFER_TITLES,
  offerType: OFFER_TYPE,
  offerCheckIn: OFFER_CHECKIN,
  offerCheckOut: OFFER_CHECKOUT,
  offerFeatures: OFFER_FEATURES,
  offerPhotos: OFFER_PHOTOS,
  priceMin: MIN_PRICE,
  priceMax: MAX_PRICE,
  roomsMin: MIN_ROOMS,
  roomsMax: MAX_ROOMS,
  guestsMin: MIN_GUESTS,
  guestsMax: MAX_GUESTS,
  locationXMin: MIN_X,
  locationXMax: MAX_X,
  locationYMin: MIN_Y,
  locationYMax: MAX_Y
});

// Переключаем карту в активное состояние
MAP_ELEMENT.classList.remove('map--faded');

// Отрисовываем метки
renderPins(notices, MAP_PINS_ELEMENT);

// Отрисовываем первое объявление
renderCard(notices[0], CARD_TEMPLATE, MAP_ELEMENT, MAP_FILTERS_ELEMENT);