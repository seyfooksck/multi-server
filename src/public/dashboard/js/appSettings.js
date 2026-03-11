(() => {
    'use strict';
	
	const APP_SIDEBAR_BREAKPOINT = 1480;
	var docEl = document.documentElement;
	const APP_COLOR_OPTIONS = ['orange', 'blue', 'green', 'red', 'purple', 'pink', 'cyan', 'yellow'];

	// App settings default
	let appSettings = {
		appTheme: 'dark',
		appSidebar: 'full',
		appColor: 'red',
	};

	// Update settings
	function setAppSettings(newSettings = {}) {
		const nextSettings = {
			...appSettings,
			...newSettings
		};
		if (Object.prototype.hasOwnProperty.call(newSettings, 'appColor') && !APP_COLOR_OPTIONS.includes(newSettings.appColor)) {
			nextSettings.appColor = appSettings.appColor;
		}
		appSettings = {
			...nextSettings
		};
		applySettings();
	}

	// Apply settings to DOM
	function applySettings() {
		docEl.setAttribute("data-bs-theme", appSettings.appTheme);

		if (window.innerWidth >= APP_SIDEBAR_BREAKPOINT) {
			docEl.setAttribute("data-app-sidebar", appSettings.appSidebar);
		}

		docEl.setAttribute("data-color-theme", appSettings.appColor);
	}

	// Initialize
	document.addEventListener("DOMContentLoaded", applySettings);
	window.setAppSettings = setAppSettings;
	window.appColorOptions = APP_COLOR_OPTIONS;

})();
