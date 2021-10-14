# simsCheckbox jQuery Plugin
simsCheckbox jQuery Plugin is a plugin to create Bootstrap style checkboxes easily.
This plugin has been developed first for SmartClass Project [www.smartclass.us]

Installation
---
After downloading the files, add like below after jQuery

```html
<!-- jQuery simsCheckbox plugin -->

<link href=='path/to/plugin/simsCheckbox.css' rel='stylesheet' type='text/css' />

<script src='path/to/plugin/simsCheckbox.js' type='text/javascript'></script>
```

Simple Usage
---

A simple way to create Bootstrap style checkboxes

```js
$(document).ready(function (){
    $("selector").simsCheckbox();
});
```

Example
---

Set your html elements to be styled

```html
<ul class="sims-batch-students">
    <li>Jamie Blue</li>
    <li>Mike Tennis</li>
    <li class="checked">Quentin Hiker</li>
</ul>
```

use default options

```js
$(document).ready(function (){
    $(".sims-batch-students").simsCheckbox();
});
```
Before

![File Input Screenshot](https://www.smartclass.us/img/plugins/simsCheckbox/before.png)

After

![File Input Screenshot](https://www.smartclass.us/img/plugins/simsCheckbox/after.png)


Example (disabled checkbox)
---

Add `disabled` class to your html elements which you do not want them clickable

```html
<ul class="sims-batch-students">
    <li>Jamie Blue</li>
    <li class="disabled">Mike Tennis</li>
    <li class="checked">Quentin Hiker</li>
    <li class="checked disabled">John Spark</li>
</ul>
```

![File Input Screenshot](https://www.smartclass.us/img/plugins/simsCheckbox/disabled.png)


Example (callback event)
---


```html
<div class="panel panel-default">
	<div class="panel-heading">Students</div>
	<div class="panel-body">
		<ul class="sims-batch-students">
		    <li>Jamie Blue</li>
		    <li class="disabled">Mike Tennis</li>
		    <li class="checked">Quentin Hiker</li>
		    <li class="checked disabled">John Spark</li>
		</ul>
	</div>
</div>
```

```js
$(document).ready(function (){
    $(".sims-batch-students").simsCheckbox({
        ifChecked: function() {
            console.log('checked');
        },
        ifUnchecked: function() {
            console.log('unchecked');
        },
        ifToggled: function() {
            console.log('toggled');
        }
    });
});
```


Plugin Options
---
The plugin supports these following options

Name|Type|Default|Description|
---|---|---|---
btnStyle|string|`'checkbox'`|sets how buttons are gonna treat either `checkbox` or `radio` button. Possible values are `checkbox`, `radio`
height|string|`'auto'`|sets a certain height to the selector e.g. `400px`. If it is set different than `auto` then the overflow style will be set to auto as well
element|string|`'li'`|sets the html element to be styled as checkbox
titleIcon|string|`'square-o'`|sets the icon of checkbox title. This should be from Font Awesome icons and have a pair preceded by the `check-`. Possible values are `circle`, `circle-o`, `square`, `square-o`
uncheckedClass|string|`'btn-default'`|sets the class of the checkbox when it is <b>not</b> checked. Possible values are `btn-default`, `btn-info`, `btn-warning`, `btn-danger`, `btn-primary`
checkedClass|string|`'btn-warning'`|sets the class of the checkbox when it is checked. This is supposed to be different than uncheckedClass value. Possible values are `btn-default`, `btn-info`, `btn-warning`, `btn-danger`, `btn-primary`
selectAllBtn|boolean|`false`|sets whether to add a `Select/Unselect All` checkbox or not to the bottom of the list. If you turn it to be true then be advised to use `selectAllText` option in your language. Possible values are `false`, `true`
selectAllText|string|`'Select/Unselect All'`|sets the title of the `Select/Unselect All` checkbox. Applies if `selectAllBtn` is true
ifChecked|function|`null`|function that is initiated right after the click event if the checkbox is checked
ifUnChecked|function|`null`|function that is initiated right after the click event if the checkbox is not checked
ifToggled|function|`null`|function that is initiated right after the checkbox toggles
