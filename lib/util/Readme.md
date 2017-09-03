<a name="Util"></a>

## Util
Class representing the core utilities

**Kind**: global class  

* [Util](#Util)
    * [.page(name, path)](#Util+page) ⇒ <code>string</code>
    * [.json(path)](#Util+json) ⇒ <code>object</code>

<a name="Util+page"></a>

### util.page(name, path) ⇒ <code>string</code>
Util.page() - 
Renders and returns a page at a path

**Kind**: instance method of [<code>Util</code>](#Util)  
**Returns**: <code>string</code> - Page string  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name of page (for caching) |
| path | <code>string</code> | Path to html page |

<a name="Util+json"></a>

### util.json(path) ⇒ <code>object</code>
Util.json() - 
Returns parsed json object at path

**Kind**: instance method of [<code>Util</code>](#Util)  
**Returns**: <code>object</code> - Contents of file as parsed object (or array or string)  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | Path of .json file |

