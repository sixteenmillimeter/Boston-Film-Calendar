<a name="Scrape"></a>

## Scrape
Class representing the scraping jobs

**Kind**: global class  

* [Scrape](#Scrape)
    * [.getGcals(name, path)](#Scrape+getGcals) ⇒ <code>string</code>
    * [.gcals(cb)](#Scrape+gcals)
    * [.flatten(obj)](#Scrape+flatten) ⇒ <code>array</code>
    * [.scrapeCutoff()](#Scrape+scrapeCutoff) ⇒ <code>integer</code>
    * [.getAgx(callback)](#Scrape+getAgx)
    * [.agx(cb)](#Scrape+agx)
    * [.getMassart(callback)](#Scrape+getMassart)
    * [.massartParseDate(str)](#Scrape+massartParseDate) ⇒ <code>string</code>
    * [.massartStartDate(str)](#Scrape+massartStartDate) ⇒ <code>integer</code>
    * [.massartEndDate(str)](#Scrape+massartEndDate) ⇒ <code>integer</code>
    * [.massartInsertAll(events, cb)](#Scrape+massartInsertAll)
    * [.massart(cb)](#Scrape+massart)

<a name="Scrape+getGcals"></a>

### scrape.getGcals(name, path) ⇒ <code>string</code>
Scrape.gcals() - 
Downloads all google calendars and adds them to a global object

**Kind**: instance method of [<code>Scrape</code>](#Scrape)  
**Returns**: <code>string</code> - Page string  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name of page (for caching) |
| path | <code>string</code> | Path to html page |

<a name="Scrape+gcals"></a>

### scrape.gcals(cb)
Scrape.gcals() - 
Retrieves all Google Calendar data and inserts into database if unique
TODO: Refactor with async library

**Kind**: instance method of [<code>Scrape</code>](#Scrape)  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | Invoked after gcal job is complete |

<a name="Scrape+flatten"></a>

### scrape.flatten(obj) ⇒ <code>array</code>
Scrape.flatten() - 
Flattens an object into an array

**Kind**: instance method of [<code>Scrape</code>](#Scrape)  
**Returns**: <code>array</code> - Flattened object  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>object</code> | Object to flatten |

<a name="Scrape+scrapeCutoff"></a>

### scrape.scrapeCutoff() ⇒ <code>integer</code>
Scrape.cutoff() - 
Function determining a cutoff date prevent importing old events

**Kind**: instance method of [<code>Scrape</code>](#Scrape)  
**Returns**: <code>integer</code> - Timestamp of cutoff date  
<a name="Scrape+getAgx"></a>

### scrape.getAgx(callback)
Scrape.getAgx() - 
Downloads json file containing all current agx events

**Kind**: instance method of [<code>Scrape</code>](#Scrape)  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | Invoked after json is downloaded |

<a name="Scrape+agx"></a>

### scrape.agx(cb)
Scrape.agx() - 
Takes all downloaded events and inserts them into table if unique

**Kind**: instance method of [<code>Scrape</code>](#Scrape)  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | Invoked after job is complete |

<a name="Scrape+getMassart"></a>

### scrape.getMassart(callback)
Scrape.getMassart() - 
Downloads the massart film society page for later parsing

**Kind**: instance method of [<code>Scrape</code>](#Scrape)  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | Invoked after page is downloaded |

<a name="Scrape+massartParseDate"></a>

### scrape.massartParseDate(str) ⇒ <code>string</code>
Scrape.massartParseDate() - 
Parse dates found in massart film society titles

**Kind**: instance method of [<code>Scrape</code>](#Scrape)  
**Returns**: <code>string</code> - Improved string  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>string</code> | Raw date string |

<a name="Scrape+massartStartDate"></a>

### scrape.massartStartDate(str) ⇒ <code>integer</code>
Scrape.massartStartDate() - 
Determines the start date of a film society event

**Kind**: instance method of [<code>Scrape</code>](#Scrape)  
**Returns**: <code>integer</code> - Start time as timestamp  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>string</code> | Raw date string |

<a name="Scrape+massartEndDate"></a>

### scrape.massartEndDate(str) ⇒ <code>integer</code>
Scrape.massartEndDate() - 
Determines the end date of a film society event

**Kind**: instance method of [<code>Scrape</code>](#Scrape)  
**Returns**: <code>integer</code> - Start time as timestamp  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>string</code> | Raw date string |

<a name="Scrape+massartInsertAll"></a>

### scrape.massartInsertAll(events, cb)
Scrape.massartInsertAll() - 
Loops through all events inserts them if they're unique

**Kind**: instance method of [<code>Scrape</code>](#Scrape)  

| Param | Type | Description |
| --- | --- | --- |
| events | <code>array</code> | Array of event objects to insert into calendar table |
| cb | <code>function</code> | Invoked after job is complete |

<a name="Scrape+massart"></a>

### scrape.massart(cb)
Scrape.massart() - 
Downloads massart website and extracts new events

**Kind**: instance method of [<code>Scrape</code>](#Scrape)  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | Passed to next function to be invoked |

