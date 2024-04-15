## Enable search 🔍 in your website

- Include follwing js and css in the `head` section

```html
<script type="text/javascript" src="https://speechindia.in/lib/search.js"></script>
<link href="https://speechindia.in/lib/search.css" rel="stylesheet" type="text/css">
```



- Code for search box is as follow:
```html
<span id="searchBox">
      <input id="searchText" type="text" placeholder="speak or type">
      <button style="position: absolute;">Search</button>
</span>
```

## Enable speech 🎙 in search
- Include following css line in the `head` section
``` html
<link rel="stylesheet" type="text/css" href="https://speechindia.in/lib/asr/mic.css">
```
- Include following javascript code before  ending `</body>` tag
``` html
<script>
  var transcribed_text = document.getElementById("searchText");
</script>

<script src="https://speechindia.in/lib/asr/RecordRTC.js"></script>
<script src="https://speechindia.in/lib/asr/hark.js"></script>
<script src="https://speechindia.in/lib/asr/asr_app.js"></script>
```
- Use the follwing line to render speech icon on the wepage
``` html
<button class="record_btn" id="micButton" style="font-size: 20px; vertical-align: top; margin-right: -70%; z-index: 1;  position: relative;"></button>
```
>You can positon the button according to your webpage and change the paramereters like font-size,margin etc. accordingly.
>
>_NOTE: Do not insert mic button inside span/div containing input box and search button_

## You can find the demo [here](https://speechindia.in/)

## Find more info about search library [here](https://marcoboschi.altervista.org/en/js/5/)
