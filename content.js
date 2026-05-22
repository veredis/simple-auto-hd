(function () {
    // Wait for the page to trigger "yt-navigate-finish" event
    document.addEventListener('yt-navigate-finish', function (event) {
        // Trigger ovserver code only if the page contains '/watch' path
        if (location.pathname === '/watch') {
            runObserverIfExtensionEnabled();
        }
    });

    function runObserverIfExtensionEnabled() {
        chrome.storage.sync.get(['extensionEnabled'], function(result) {
            if(result.extensionEnabled !== undefined && result.extensionEnabled === false) {
                console.log('Simple Auto HD Extension Disabled. Please enable it through popup menu.');
            } else {
                console.log('Simple Auto HD Extension Enabled. Proceeding to initiate observer ');
                initiateObserverAndObserve();
            }
        });
    }

    // Configuration of the observer
    var config = {
        childList: true,
        attributes: true,
        subtree: true,
        characterData: true
    };

    var theaterModeTitles = [
        'Teatermodus',
        'Teatr rejimi',
        'Tampilan bioskop',
        'Mod teater',
        'Način rada za kino',
        'Mode Cinema',
        'Režim kina',
        'Biograftilstand',
        'Kinomodus',
        'Kinorežiim',
        'Cinema mode',
        'Theater mode',
        'Modo Cine',
        'Modo cine',
        'Antzoki modua',
        'Mode cinéma',
        'Kinematografski način rada',
        'Imodi yethiyetha',
        'Kvikmyndahúsastilling',
        'Hali ya ukumbi wa filamu',
        'Teātra režīms',
        'Kino režimas',
        'Mozi mód',
        'Theatermodus',
        'Modo cinema',
        'Modo Teatro',
        'Modul Cinema',
        'Modaliteti i kinemasë',
        'Način kina',
        'Bioskopski režim',
        'Teatteritila',
        'Bioläge',
        'Chế độ rạp chiếu phim',
        'Sinema modu',
        'Рэжым тэатра',
        'Театр режими',
        'Режим на кино сала',
        'Широкий экран',
        'Режим домашнього кінотеатру',
        'Λειτουργία κινηματογράφου',
        'Լայն էկրան',
        'מצב קולנוע',
        'تھیٹر وضع',
        'وضع المسرح',
        'حالت نمایش',
        'थिएटर मोड',
        'থিয়েটাৰ ম’ড',
        'সিনেমা হল মোড',
        'ਥੀਏਟਰ ਮੋਡ',
        'થિયેટર મોડ',
        'ଥିଏଟର୍‌ ମୋଡ୍‌',
        'அரங்கு பயன்முறை',
        'థియేటర్ మోడ్',
        'ಥಿಯೇಟರ್ ಮೋಡ್',
        'തീയേറ്റർ മോഡ്',
        'රඟහල ප්‍රකාරය',
        'โหมดโรงภาพยนตร์',
        'ຮູບແບບໂຮງລະຄອນ',
        'ရုပ်ရှင်ရုံ အနေအထား',
        'თეატრალური რეჟიმი',
        'ቲያትር ሁነታ',
        'របៀប​រោងភាពយន្ត',
        '剧场模式',
        '劇院模式',
        'シアター モード',
        '영화관 모드(t)'
    ];

    var qualitiesArray = [
        '4320p',
        '4320p60',
        '4320p50',
        '4320p48',
        '2160p',
        '2160p60',
        '2160p50',
        '2160p48',
        '1440p',
        '1440p60',
        '1440p50',
        '1440p48',
        '1080p',
        '1080p60',
        '1080p50',
        '1080p48',
        '720p',
        '720p60',
        '720p50',
        '720p48',
        '480p',
        '360p',
        '240p',
        '144p',
        'Auto'
    ];

    var qualityTitles = [
        'Gehalte',
        'Keyfiyyət',
        'Kualitas',
        'Kualiti',
        'Kvalitet',
        'Qualitat',
        'Kvalita',
        'Qualität',
        'Kvaliteet',
        'Quality',
        'Calidad',
        'Kalitatea',
        'Kalidad',
        'Qualité',
        'Calidade',
        'Kvaliteta',
        'Ikhwalithi',
        'Gæði',
        'Ubora',
        'Kvalitāte',
        'Kokybė',
        'Minőség',
        'Kwaliteit',
        'Sifati',
        'Qualidade',
        'Calitate',
        'Cilësia',
        'Kakovost',
        'Laatu',
        'Chất lượng',
        'Kalite',
        'Якасць',
        'Сапаты',
        'Квалитет',
        'Качество',
        'Якість',
        'Ποιότητα',
        'Որակ',
        'איכות',
        'معیار',
        'الجودة',
        'کیفیت',
        'गुण',
        'गुणवत्ता',
        'क्वालिटी',
        'গুণাগুণ',
        'গুণমান',
        'ਗੁਣਵੱਤਾ',
        'ક્વૉલિટી',
        'ଗୁଣବତ୍ତା',
        'தரம்',
        'క్వాలిటీ',
        'ಗುಣಮಟ್ಟ',
        'നിലവാരം',
        'ගුණත්වය',
        'คุณภาพ',
        'ຄຸນນະພາບ',
        'အရည်အသွေး',
        'ხარისხი',
        'ጥራት',
        'គុណភាព​',
        '画质',
        '畫質',
        '画質',
        '화질'
    ];

    var menuWaitTimeout = 1500;
    var menuCloseDelay = 200;

    function normalizeMenuText(text) {
        return (text || '').replace(/\s+/g, ' ').trim();
    }

    function isElementVisible(element) {
        return !!(element && (element.offsetWidth || element.offsetHeight || element.getClientRects().length));
    }

    function getMenuItemFromLabel(label) {
        return label.closest('.ytp-menuitem') || label;
    }

    function waitForValue(getValue, timeout) {
        return new Promise(function(resolve) {
            var value = getValue();

            if (value) {
                resolve(value);
                return;
            }

            var endTime = Date.now() + timeout;
            var interval = setInterval(function() {
                value = getValue();

                if (value || Date.now() >= endTime) {
                    clearInterval(interval);
                    resolve(value || null);
                }
            }, 50);
        });
    }

    function isSettingsMenuOpen(settingsButton) {
        var settingsMenu = document.querySelector('.ytp-settings-menu');
        return (settingsButton && settingsButton.getAttribute('aria-expanded') === 'true') || isElementVisible(settingsMenu);
    }

    function openSettingsMenu(settingsButton) {
        if (!isSettingsMenuOpen(settingsButton)) {
            settingsButton.click();
        }
    }

    function closeSettingsMenu(settingsButton) {
        if (isSettingsMenuOpen(settingsButton)) {
            settingsButton.click();
        }
    }

    function findQualityMenuLabel() {
        var labels = Array.from(document.querySelectorAll('.ytp-menuitem-label'));

        for (var i = 0; i < labels.length; i++) {
            var menuItem = getMenuItemFromLabel(labels[i]);
            var labelText = normalizeMenuText(labels[i].textContent);

            if (isElementVisible(menuItem) && qualityTitles.includes(labelText)) {
                return labels[i];
            }
        }

        return null;
    }

    function getQualityValue(label) {
        var labelText = normalizeMenuText(label.textContent);
        var match = labelText.match(/^(Auto|[0-9]+p(?:[0-9]+)?)/);

        return match ? match[1] : '';
    }

    function getVisibleQualityLabels() {
        var labels = Array.from(document.querySelectorAll('.ytp-quality-menu .ytp-menuitem-label'));

        if (labels.length === 0) {
            labels = Array.from(document.querySelectorAll('.ytp-menuitem-label'));
        }

        return labels.filter(function(label) {
            var labelText = normalizeMenuText(label.textContent);
            var menuItem = getMenuItemFromLabel(label);

            return isElementVisible(menuItem) &&
                getQualityValue(label) !== '' &&
                !label.querySelector('.ytp-premium-label') &&
                !labelText.includes('Premium');
        });
    }

    function clickMenuLabel(label) {
        getMenuItemFromLabel(label).click();
    }

    function findQualityByName(quality, targetItems) {
        for (var i = 0; i < targetItems.length; i++) {
            if (getQualityValue(targetItems[i]) === quality) {
                return targetItems[i];
            }
        }

        return null;
    }

    function findBestAvailableQuality(targetItems) {
        for (var i = 0; i < qualitiesArray.length; i++) {
            var targetItem = findQualityByName(qualitiesArray[i], targetItems);

            if (targetItem) {
                return targetItem;
            }
        }

        return targetItems[0] || null;
    }

    // Inititate observer
    function initiateObserverAndObserve() {
        var observer = new MutationObserver(function (mutations) {
            if (!document.contains(document.querySelector('.ytp-settings-button'))) {
                return;
            }

            observer.disconnect();

            // Run code after 100ms
            setTimeout(() => {
                selectPreferredQuality();
                toggleTheaterMode();
                listenToTheaterModeButton();
            }, 100)
        });

        observer.observe(document.body, config);
    }

    // Listen to theater mode button for clicks
    function listenToTheaterModeButton() {
        var sizeButton = document.getElementsByClassName('ytp-size-button')[0];

        if (!sizeButton || sizeButton.dataset.simpleAutoHdTheaterListenerAttached === 'true') {
            return;
        }

        sizeButton.dataset.simpleAutoHdTheaterListenerAttached = 'true';
        
        // Listen to theater mode changes
        sizeButton.addEventListener('click', function(event) {
            var sizeButton = document.getElementsByClassName('ytp-size-button')[0];
            var title = sizeButton.getAttribute('data-title-no-tooltip');

            var sizeButtonHasTheaterModeTitle = theaterModeTitles.includes(title);

            if (sizeButtonHasTheaterModeTitle) {
                setTheaterModeBoolean(true);
            } else {
                setTheaterModeBoolean(false);
            }
        });
    }

    // Update storage value for theater mode
    var setTheaterModeBoolean = function(theaterMode) {
        chrome.storage.sync.set({theaterMode: theaterMode}, function() {});
    }

    // Get storage value and update theater mode
    var toggleTheaterMode = function () {
        chrome.storage.sync.get(['theaterMode'], function (result) {
            updateTheaterMode(result.theaterMode);
        });
    };

    // Update theater mode
    var updateTheaterMode = function (theaterMode) {
        if (theaterMode === undefined) {
            chrome.storage.sync.set({ theaterMode: false }, function () { });
        }

        var sizeButton = document.getElementsByClassName('ytp-size-button')[0];

        if (!sizeButton) {
            return;
        }

        var sizeButtonHasTheaterModeTitle = theaterModeTitles.includes(sizeButton.getAttribute('data-title-no-tooltip'));

        if (theaterMode && sizeButtonHasTheaterModeTitle) {
            sizeButton.click();
        } else if (!theaterMode && !sizeButtonHasTheaterModeTitle) {
            sizeButton.click();
        }
    }

    // Get storage value and update to given quality
    var selectPreferredQuality = function () {
        var preferredQuality;

        chrome.storage.sync.get(['preferredQuality'], function (result) {
            updateQuality(result.preferredQuality);
        });
    };

    // Update to given quality
    var updateQuality = async function (preferredQuality) {
        if (preferredQuality === undefined) {
            preferredQuality = 'best-available';
            chrome.storage.sync.set({ preferredQuality: preferredQuality }, function () { });
        }

        var settingsButton = document.getElementsByClassName('ytp-settings-button')[0];

        if (!settingsButton) {
            return;
        }

        try {
            openSettingsMenu(settingsButton);

            var qualityMenuLabel = await waitForValue(findQualityMenuLabel, menuWaitTimeout);

            if (!qualityMenuLabel) {
                throw new Error('Quality menu item was not found');
            }

            clickMenuLabel(qualityMenuLabel);

            var targetItems = await waitForValue(function() {
                var items = getVisibleQualityLabels();
                return items.length > 0 ? items : null;
            }, menuWaitTimeout);

            if (!targetItems) {
                throw new Error('Quality options were not found');
            }

            var targetItem = preferredQuality === 'best-available'
                ? findBestAvailableQuality(targetItems)
                : findTargetItem(preferredQuality, targetItems);

            if (!targetItem) {
                throw new Error('Preferred quality was not found');
            }

            clickMenuLabel(targetItem);
        } catch (error) {
            console.log('Simple Auto HD could not update quality:', error);
        } finally {
            setTimeout(function() {
                closeSettingsMenu(settingsButton);
            }, menuCloseDelay);
        }
    }

    // Find the target quality
    function findTargetItem(preferredQuality, targetItems) {
        var key = qualitiesArray.indexOf(preferredQuality);

        if (key === -1) {
            return findBestAvailableQuality(targetItems);
        }

        for (var i = key; i < qualitiesArray.length; i++) {
            var targetItem = findQualityByName(qualitiesArray[i], targetItems);

            if (targetItem) {
                return targetItem;
            }
        }

        return findBestAvailableQuality(targetItems);
    }

    // Listen for chrome storage changes
    chrome.storage.onChanged.addListener(function (changes, namespace) {
        for (var key in changes) {
            if (key === 'theaterMode') {
                toggleTheaterMode();
            } else if (key === 'preferredQuality') {
                selectPreferredQuality();
            }
        }
    });
})();

