// ==UserScript==
// @name         DonderHiroba Translation Patch
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Translate DonderHiroba
// @match        https://donderhiroba.jp/*
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function() {
    'use strict';

    let translations = {};

    const files = [
        "https://raw.githubusercontent.com/SkippyTheLost/donderhiroba-patch/main/translations/ui.json",
        "https://raw.githubusercontent.com/SkippyTheLost/donderhiroba-patch/main/translations/songs.json",
        "https://raw.githubusercontent.com/SkippyTheLost/donderhiroba-patch/main/translations/rewards.json"
    ];

    function mergeTranslations(newData) {
        translations = { ...translations, ...newData };
    }

    function translateText(text) {
        let newText = text;
        for (let jp in translations) {
            if (newText.includes(jp)) {
                newText = newText.replace(new RegExp(jp, "g"), translations[jp]);
            }
        }
        return newText;
    }

function translatePage() {
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    let node;
    while ((node = walker.nextNode())) {
        const oldText = node.nodeValue;
        const newText = translateText(oldText);
        if (oldText !== newText) {
            node.nodeValue = newText;
        }
    }
}


    function startObserver() {
        const observer = new MutationObserver(translatePage);
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function fetchJSON(url) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url,
                onload: res => {
                    try {
                        resolve(JSON.parse(res.responseText));
                    } catch (e) {
                        reject(e);
                    }
                },
                onerror: reject
            });
        });
    }

    Promise.all(files.map(fetchJSON))
        .then(dataArray => {
            dataArray.forEach(data => mergeTranslations(data));
            translatePage();
            startObserver();
        })
        .catch(err => console.error("Translation load error:", err));

})();