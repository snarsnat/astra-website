// Astra Security SDK v1.0.0 (Development Version)
// https://astra.security

(function(window, document) {
    'use strict';
    
    const SDK_VERSION = '1.0.0';
    const API_BASE_URL = 'https://api.astra.security/v1';
    const COLLECTION_INTERVAL = 60000;
    const MAX_BATCH_SIZE = 100;
    
    let analyticsQueue = [];
    let sessionId = null;
    let initialized = false;
    let apiKey = null;
    let config = {};
    
    function generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    function collectPageData() {
        return {
            url: window.location.href,
            referrer: document.referrer,
            title: document.title,
            language: navigator.language,
            userAgent: navigator.userAgent,
            screen: {
                width: window.screen.width,
                height: window.screen.height,
                colorDepth: window.screen.colorDepth
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timestamp: new Date().toISOString()
        };
    }
    
    function collectPerformanceData() {
        if (!window.performance || !window.performance.timing) return null;
        
        const timing = window.performance.timing;
        const navigation = window.performance.navigation || {};
        
        return {
            navigationType: navigation.type || 0,
            redirectCount: navigation.redirectCount || 0,
            timing: {
                navigationStart: timing.navigationStart,
                redirectStart: timing.redirectStart,
                redirectEnd: timing.redirectEnd,
                fetchStart: timing.fetchStart,
                domainLookupStart: timing.domainLookupStart,
                domainLookupEnd: timing.domainLookupEnd,
                connectStart: timing.connectStart,
                connectEnd: timing.connectEnd,
                secureConnectionStart: timing.secureConnectionStart,
                requestStart: timing.requestStart,
                responseStart: timing.responseStart,
                responseEnd: timing.responseEnd,
                domLoading: timing.domLoading,
                domInteractive: timing.domInteractive,
                domContentLoadedEventStart: timing.domContentLoadedEventStart,
                domContentLoadedEventEnd: timing.domContentLoadedEventEnd,
                domComplete: timing.domComplete,
                loadEventStart: timing.loadEventStart,
                loadEventEnd: timing.loadEventEnd
            }
        };
    }
    
    function collectSecurityData() {
        return {
            https: window.location.protocol === 'https:',
            cookiesEnabled: navigator.cookieEnabled,
            localStorage: typeof window.localStorage !== 'undefined',
            sessionStorage: typeof window.sessionStorage !== 'undefined',
            indexedDB: typeof window.indexedDB !== 'undefined',
            serviceWorker: 'serviceWorker' in navigator,
            webRTC: 'RTCPeerConnection' in window,
            webGL: (function() {
                try {
                    const canvas = document.createElement('canvas');
                    return !!(window.WebGLRenderingContext && 
                             (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
                } catch(e) {
                    return false;
                }
            })(),
            webAudio: 'AudioContext' in window || 'webkitAudioContext' in window,
            geolocation: 'geolocation' in navigator,
            notifications: 'Notification' in window,
            pushManager: 'PushManager' in window,
            credentials: 'credentials' in navigator,
            paymentRequest: 'PaymentRequest' in window
        };
    }
    
    function collectNetworkData() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (!connection) return null;
        
        return {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData,
            type: connection.type
        };
    }
    
    function collectErrorData(error) {
        return {
            message: error.message,
            filename: error.filename || '',
            lineno: error.lineno || 0,
            colno: error.colno || 0,
            stack: error.stack || '',
            timestamp: new Date().toISOString()
        };
    }
    
    function sendAnalyticsBatch() {
        if (analyticsQueue.length === 0 || !apiKey) return;
        
        const batch = analyticsQueue.splice(0, MAX_BATCH_SIZE);
        
        fetch(API_BASE_URL + '/analytics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + apiKey,
                'X-Astra-SDK-Version': SDK_VERSION
            },
            body: JSON.stringify({
                sessionId: sessionId,
                events: batch,
                timestamp: new Date().toISOString()
            })
        })
        .then(response => {
            if (!response.ok) {
                console.warn('[Astra] Failed to send analytics:', response.status);
                analyticsQueue = batch.concat(analyticsQueue);
            }
        })
        .catch(error => {
            console.warn('[Astra] Error sending analytics:', error);
            analyticsQueue = batch.concat(analyticsQueue);
        });
    }
    
    function queueAnalyticsEvent(type, data) {
        analyticsQueue.push({
            type: type,
            data: data,
            timestamp: new Date().toISOString()
        });
        
        if (analyticsQueue.length >= MAX_BATCH_SIZE) {
            sendAnalyticsBatch();
        }
    }
    
    function initErrorTracking() {
        window.addEventListener('error', function(event) {
            queueAnalyticsEvent('error', collectErrorData(event.error || event));
        });
        
        window.addEventListener('unhandledrejection', function(event) {
            queueAnalyticsEvent('promise_rejection', {
                reason: event.reason ? event.reason.toString() : 'Unknown',
                timestamp: new Date().toISOString()
            });
        });
        
        if (config.trackConsoleErrors) {
            const originalConsoleError = console.error;
            console.error = function() {
                queueAnalyticsEvent('console_error', {
                    message: Array.from(arguments).join(' '),
                    timestamp: new Date().toISOString()
                });
                originalConsoleError.apply(console, arguments);
            };
        }
    }
    
    function initPerformanceTracking() {
        if (window.performance && window.performance.timing) {
            window.addEventListener('load', function() {
                setTimeout(function() {
                    const perfData = collectPerformanceData();
                    if (perfData) {
                        queueAnalyticsEvent('performance', perfData);
                    }
                }, 0);
            });
        }
    }
    
    function initInteractionTracking() {
        if (config.trackInteractions) {
            document.addEventListener('click', function(event) {
                const target = event.target;
                queueAnalyticsEvent('click', {
                    tagName: target.tagName,
                    id: target.id,
                    className: target.className,
                    text: target.textContent ? target.textContent.substring(0, 100) : '',
                    href: target.href || '',
                    x: event.clientX,
                    y: event.clientY
                });
            });
        }
    }
    
    function startPeriodicCollection() {
        setInterval(function() {
            queueAnalyticsEvent('page_heartbeat', collectPageData());
            if (analyticsQueue.length > 0) {
                sendAnalyticsBatch();
            }
        }, COLLECTION_INTERVAL);
    }
    
    const Astra = function(options) {
        if (!options || !options.apiKey) {
            throw new Error('Astra SDK requires an apiKey');
        }
        
        apiKey = options.apiKey;
        config = {
            trackConsoleErrors: options.trackConsoleErrors !== false,
            trackInteractions: options.trackInteractions !== false,
            monitorNetwork: options.monitorNetwork !== false,
            monitorSecurity: options.monitorSecurity !== false,
            ...options
        };
        
        return this;
    };
    
    Astra.prototype.init = function() {
        if (initialized) {
            console.warn('[Astra] SDK already initialized');
            return this;
        }
        
        sessionId = generateSessionId();
        initialized = true;
        
        queueAnalyticsEvent('session_start', {
            sessionId: sessionId,
            pageData: collectPageData(),
            securityData: collectSecurityData(),
            networkData: collectNetworkData()
        });
        
        initErrorTracking();
        initPerformanceTracking();
        initInteractionTracking();
        startPeriodicCollection();
        
        setTimeout(sendAnalyticsBatch, 1000);
        
        console.log('[Astra] SDK initialized successfully');
        return this;
    };
    
    Astra.prototype.track = function(eventName, eventData) {
        if (!initialized) {
            console.warn('[Astra] SDK not initialized. Call init() first.');
            return this;
        }
        
        queueAnalyticsEvent('custom_' + eventName, {
            name: eventName,
            data: eventData,
            timestamp: new Date().toISOString()
        });
        
        return this;
    };
    
    Astra.prototype.flush = function() {
        sendAnalyticsBatch();
        return this;
    };
    
    Astra.prototype.getSessionId = function() {
        return sessionId;
    };
    
    window.Astra = Astra;
    
    document.addEventListener('DOMContentLoaded', function() {
        const script = document.currentScript;
        if (script && script.dataset.apiKey) {
            try {
                const astra = new Astra({
                    apiKey: script.dataset.apiKey,
                    trackConsoleErrors: script.dataset.trackConsoleErrors !== 'false',
                    trackInteractions: script.dataset.trackInteractions !== 'false',
                    monitorNetwork: script.dataset.monitorNetwork !== 'false',
                    monitorSecurity: script.dataset.monitorSecurity !== 'false'
                });
                astra.init();
                window.astra = astra;
            } catch(error) {
                console.error('[Astra] Auto-initialization failed:', error);
            }
        }
    });
    
})(window, document);