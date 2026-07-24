/*
 * Flipbook basic sample
 */

/* 동적으로 페이지 추가 */
function addPage(page, book) {

	var element = $('<div />');

	if (book.turn('addPage', element, page)) {

		element.html(
			'<div class="gradient"></div>' +
			'<div class="loader"></div>'
		);

		loadPage(page, element);
	}
}


/* 페이지 이미지 불러오기 */
function loadPage(page, pageElement) {

	var img = $('<img />');

	img.on('mousedown', function (e) {
		e.preventDefault();
	});

	img.on('load', function () {

		$(this).css({
			width: '100%',
			height: '100%'
		});

		$(this).appendTo(pageElement);

		pageElement.find('.loader').remove();
	});

	img.attr('src', 'pages/' + page + '.jpg');
}


/* 고화질 페이지 불러오기 */
function loadLargePage(page, pageElement) {

	var img = $('<img />');

	img.on('load', function () {

		var prevImg = pageElement.find('img');

		$(this).css({
			width: '100%',
			height: '100%'
		});

		$(this).appendTo(pageElement);

		prevImg.remove();
	});

	img.attr('src', 'pages/' + page + '-large.jpg');
}


/* 일반 화질 페이지로 변경 */
function loadSmallPage(page, pageElement) {

	var img = pageElement.find('img');

	img.css({
		width: '100%',
		height: '100%'
	});

	img.off('load');

	img.attr('src', 'pages/' + page + '.jpg');
}


/* 크롬 브라우저 확인 */
function isChrome() {

	return navigator.userAgent.indexOf('Chrome') !== -1;
}


/* 플립북 실행 */
function loadApp() {

	var $flipbook = $('.flipbook');

	if (!$flipbook.length) {
		return;
	}

	/* turn.js 초기화 */
	$flipbook.turn({
		width: 922,
		height: 600,
		elevation: 50,
		gradients: true,
		autoCenter: true
	});


	/* 안내문 표시 및 숨김 */
	$flipbook.bind('turned', function (e, page) {

		if (page === 1) {
			$('h5').removeClass('hide');
		} else {
			$('h5').addClass('hide');
		}
	});


	/*
	 * 페이지 본문 클릭 이동
	 *
	 * 왼쪽 절반 클릭  → 이전 페이지
	 * 오른쪽 절반 클릭 → 다음 페이지
	 *
	 * 책 모서리 영역은 turn.js 기본 동작을 유지
	 */

	var startX = 0;
	var startY = 0;
	var mouseMoved = false;
	var touchHandled = false;


	/* 마우스를 누른 위치 저장 */
	document.addEventListener('mousedown', function (e) {

		var rect = $flipbook[0].getBoundingClientRect();

		if (
			e.clientX < rect.left ||
			e.clientX > rect.right ||
			e.clientY < rect.top ||
			e.clientY > rect.bottom
		) {
			return;
		}

		startX = e.clientX;
		startY = e.clientY;
		mouseMoved = false;

	}, true);


	/* 드래그 여부 확인 */
	document.addEventListener('mousemove', function (e) {

		if (
			Math.abs(e.clientX - startX) > 8 ||
			Math.abs(e.clientY - startY) > 8
		) {
			mouseMoved = true;
		}

	}, true);


	/* PC 클릭 처리 */
	document.addEventListener('click', function (e) {

		if (touchHandled) {
			touchHandled = false;
			return;
		}

		if (mouseMoved) {
			return;
		}

		var flipbookElement = $flipbook[0];
		var rect = flipbookElement.getBoundingClientRect();

		/* 클릭 위치가 책 내부인지 확인 */
		if (
			e.clientX < rect.left ||
			e.clientX > rect.right ||
			e.clientY < rect.top ||
			e.clientY > rect.bottom
		) {
			return;
		}

		var clickX = e.clientX - rect.left;
		var clickY = e.clientY - rect.top;

		var bookWidth = rect.width;
		var bookHeight = rect.height;

		/*
		 * 모서리 영역에서는 turn.js 기본 넘김 유지
		 * 모서리 크기: 가로 70px, 세로 70px
		 */
		var cornerWidth = 70;
		var cornerHeight = 70;

		var isLeftCorner =
			clickX <= cornerWidth &&
			(
				clickY <= cornerHeight ||
				clickY >= bookHeight - cornerHeight
			);

		var isRightCorner =
			clickX >= bookWidth - cornerWidth &&
			(
				clickY <= cornerHeight ||
				clickY >= bookHeight - cornerHeight
			);

		if (isLeftCorner || isRightCorner) {
			return;
		}

		/* turn.js 기본 클릭 이벤트 차단 */
		e.preventDefault();
		e.stopPropagation();

		if (e.stopImmediatePropagation) {
			e.stopImmediatePropagation();
		}

		moveBookByClick(clickX, bookWidth);

	}, true);


	/* 모바일 터치 시작 */
	document.addEventListener('touchstart', function (e) {

		if (!e.touches || !e.touches.length) {
			return;
		}

		var touch = e.touches[0];
		var rect = $flipbook[0].getBoundingClientRect();

		if (
			touch.clientX < rect.left ||
			touch.clientX > rect.right ||
			touch.clientY < rect.top ||
			touch.clientY > rect.bottom
		) {
			return;
		}

		startX = touch.clientX;
		startY = touch.clientY;
		mouseMoved = false;

	}, true);


	/* 모바일 드래그 여부 확인 */
	document.addEventListener('touchmove', function (e) {

		if (!e.touches || !e.touches.length) {
			return;
		}

		var touch = e.touches[0];

		if (
			Math.abs(touch.clientX - startX) > 12 ||
			Math.abs(touch.clientY - startY) > 12
		) {
			mouseMoved = true;
		}

	}, true);


	/* 모바일 터치 처리 */
	document.addEventListener('touchend', function (e) {

		if (mouseMoved) {
			return;
		}

		if (!e.changedTouches || !e.changedTouches.length) {
			return;
		}

		var touch = e.changedTouches[0];
		var flipbookElement = $flipbook[0];
		var rect = flipbookElement.getBoundingClientRect();

		if (
			touch.clientX < rect.left ||
			touch.clientX > rect.right ||
			touch.clientY < rect.top ||
			touch.clientY > rect.bottom
		) {
			return;
		}

		var clickX = touch.clientX - rect.left;
		var clickY = touch.clientY - rect.top;

		var bookWidth = rect.width;
		var bookHeight = rect.height;

		var cornerWidth = 70;
		var cornerHeight = 70;

		var isLeftCorner =
			clickX <= cornerWidth &&
			(
				clickY <= cornerHeight ||
				clickY >= bookHeight - cornerHeight
			);

		var isRightCorner =
			clickX >= bookWidth - cornerWidth &&
			(
				clickY <= cornerHeight ||
				clickY >= bookHeight - cornerHeight
			);

		/* 모서리 드래그 기능 유지 */
		if (isLeftCorner || isRightCorner) {
			return;
		}

		e.preventDefault();
		e.stopPropagation();

		touchHandled = true;

		moveBookByClick(clickX, bookWidth);

	}, true);


	/* 클릭한 방향에 따라 책 이동 */
	function moveBookByClick(clickX, bookWidth) {

		var currentPage = $flipbook.turn('page');
		var totalPages = $flipbook.turn('pages');

		/* 왼쪽 페이지 클릭 */
		if (clickX < bookWidth / 2) {

			if (currentPage > 1) {
				$flipbook.turn('previous');
			}

		/* 오른쪽 페이지 클릭 */
		} else {

			if (currentPage < totalPages) {
				$flipbook.turn('next');
			}
		}
	}
}