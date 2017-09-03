<a name="Data"></a>

## Data
Class representing the database

**Kind**: global class  

* [Data](#Data)
    * [.wipe(table, cb)](#Data+wipe)
    * [.gcalCreate(cb)](#Data+gcalCreate)
    * [.orgsCreate(cb)](#Data+orgsCreate)
    * [.orgsGetAll(cb)](#Data+orgsGetAll)
    * [.orgsGetAllPublic(cb)](#Data+orgsGetAllPublic)
    * [.orgsWipe(cb)](#Data+orgsWipe)
    * [.orgsInsert(cb)](#Data+orgsInsert)
    * [.calCreate(cb)](#Data+calCreate)
    * [.gcalFields(obj)](#Data+gcalFields) ⇒ <code>object</code>
    * [.calAgx(obj)](#Data+calAgx) ⇒ <code>object</code>
    * [.calInsert(obj, cb, single)](#Data+calInsert)
    * [.calUpdate(id, obj, cb)](#Data+calUpdate)
    * [.calWipe(cb)](#Data+calWipe)
    * [.calGetAll(cb)](#Data+calGetAll)
    * [.calGetAllOrg(org_id, cb)](#Data+calGetAllOrg)
    * [.calGetMonthValidate(month, year)](#Data+calGetMonthValidate) ⇒ <code>boolean</code>
    * [.calGetMonthRange(cb)](#Data+calGetMonthRange)
    * [.calGetMonth(month, year, cb)](#Data+calGetMonth)
    * [.calDelete(event_id, cb)](#Data+calDelete)

<a name="Data+wipe"></a>

### data.wipe(table, cb)
Data.wipe() - 
Drops table matching name provided

**Kind**: instance method of [<code>Data</code>](#Data)  

| Param | Type | Description |
| --- | --- | --- |
| table | <code>string</code> | Name of table |
| cb | <code>function</code> | Invoked after table is dropped |

<a name="Data+gcalCreate"></a>

### data.gcalCreate(cb)
Data.gcalCreate() - 
Creates a table of public Google Calendars which are to be pulled into the database periodically

**Kind**: instance method of [<code>Data</code>](#Data)  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | Invoked afer table is created |

<a name="Data+orgsCreate"></a>

### data.orgsCreate(cb)
Data.orgsCreate() - 
Creates a table of organizations to be referenced in the calendar

**Kind**: instance method of [<code>Data</code>](#Data)  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | Invoked after the table is created |

<a name="Data+orgsGetAll"></a>

### data.orgsGetAll(cb)
Data.orgsGetAll() - 
Retreives all organizations (used in admin panel)

**Kind**: instance method of [<code>Data</code>](#Data)  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | Invoked once query is complete |

<a name="Data+orgsGetAllPublic"></a>

### data.orgsGetAllPublic(cb)
Data.orgsGetAllPublic() - 
Retreives all organizations (to be used on public-facing site)

**Kind**: instance method of [<code>Data</code>](#Data)  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | Invoked once query is complete |

<a name="Data+orgsWipe"></a>

### data.orgsWipe(cb)
Data.orgsWipe() - 
Drops orgs table

**Kind**: instance method of [<code>Data</code>](#Data)  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | Invoked once query is complete |

<a name="Data+orgsInsert"></a>

### data.orgsInsert(cb)
Data.orgsInsert() - 
Inserts a organization record into the orgs table

**Kind**: instance method of [<code>Data</code>](#Data)  
**Params**: <code>object</code> obj Organization object containing all fields  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | Invoked once query is complete |

<a name="Data+calCreate"></a>

### data.calCreate(cb)
Data.calCreate() - 
Creates a table of events in the calendar

**Kind**: instance method of [<code>Data</code>](#Data)  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | Invoked after the table is created |

<a name="Data+gcalFields"></a>

### data.gcalFields(obj) ⇒ <code>object</code>
Data.gcalFields() - 
Modifies gcal object to a database-friendly object

**Kind**: instance method of [<code>Data</code>](#Data)  
**Returns**: <code>object</code> - Database-ready calendar event object  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>object</code> | Source object |

<a name="Data+calAgx"></a>

### data.calAgx(obj) ⇒ <code>object</code>
Data.gcalFields() - 
Modifies an agx object into a database-friendly object

**Kind**: instance method of [<code>Data</code>](#Data)  
**Returns**: <code>object</code> - Database-ready calendar event object  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>object</code> | Source object from agx calendar API |

<a name="Data+calInsert"></a>

### data.calInsert(obj, cb, single)
Data.calInsert() - 
Creates a new record in the calendar table

**Kind**: instance method of [<code>Data</code>](#Data)  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>object</code> | Object containing all calendar event fields |
| cb | <code>function</code> | Invoked after query is complete |
| single | <code>boolean</code> | Optional flag determining whether query fields have single quotes replace |

<a name="Data+calUpdate"></a>

### data.calUpdate(id, obj, cb)
Data.calUpdate() - 
Update a single calendar event record

**Kind**: instance method of [<code>Data</code>](#Data)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | Unique id of the calendar event to update |
| obj | <code>object</code> | New record for calendar table |
| cb | <code>function</code> | Invoked after query is completed |

<a name="Data+calWipe"></a>

### data.calWipe(cb)
Data.calWipe() - 
Drops calendar table

**Kind**: instance method of [<code>Data</code>](#Data)  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | Invoked once query is complete |

<a name="Data+calGetAll"></a>

### data.calGetAll(cb)
Data.calGetAll() - 
Retrieves all calendar events in table

**Kind**: instance method of [<code>Data</code>](#Data)  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | Invoked once query is complete |

<a name="Data+calGetAllOrg"></a>

### data.calGetAllOrg(org_id, cb)
Data.calGetAllOrg() - 
Retrieves all calendar events matching a single organization

**Kind**: instance method of [<code>Data</code>](#Data)  

| Param | Type | Description |
| --- | --- | --- |
| org_id | <code>string</code> | Machine id of the organization to match |
| cb | <code>function</code> | Invoked once query is complete |

<a name="Data+calGetMonthValidate"></a>

### data.calGetMonthValidate(month, year) ⇒ <code>boolean</code>
Data.calGetMonthValidate() - 
Function to validate month and year arguments

**Kind**: instance method of [<code>Data</code>](#Data)  
**Returns**: <code>boolean</code> - Whether values are valid  

| Param | Type | Description |
| --- | --- | --- |
| month | <code>integer</code> | Month value |
| year | <code>integer</code> | Year value |

<a name="Data+calGetMonthRange"></a>

### data.calGetMonthRange(cb)
Data.calWipe() - 
Drops calendar table

**Kind**: instance method of [<code>Data</code>](#Data)  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | Invoked once query is complete |

<a name="Data+calGetMonth"></a>

### data.calGetMonth(month, year, cb)
Data.calGetMonth() - 
Retrieve calendar events by month/year

**Kind**: instance method of [<code>Data</code>](#Data)  

| Param | Type | Description |
| --- | --- | --- |
| month | <code>integer</code> | Month to retrieve (2 digits) |
| year | <code>integer</code> | Year to retrieve (4 digits) |
| cb | <code>function</code> | Invoked once query is complete |

<a name="Data+calDelete"></a>

### data.calDelete(event_id, cb)
Data.calDelete() - 
Deletes a single entry in the calendar table

**Kind**: instance method of [<code>Data</code>](#Data)  

| Param | Type | Description |
| --- | --- | --- |
| event_id | <code>string</code> | Unique id of the calendar event to delete |
| cb | <code>function</code> | Invoked once query is complete |

