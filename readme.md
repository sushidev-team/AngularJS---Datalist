# DATALIST - AngularJS Service

### Version
0.0.1.1

### Installation

#### Step 1

```sh
$ bower install ambersive-datalist
```
#### Step 2
You first have to declare the 'ambersive.datalist' module dependency inside your app module (perhaps inside your app main module).
Please be aware, that you need ambersive.helper, ambersive.rest

```sh
angular.module('app', ['ambersive.datalist']);
```
### Useage

```sh

<datalist rest-url="RESTFUL URL GOES HERE"></datalist>

```

Please notice that the rest-url result should be like the following. Otherwise the datalist directive will notice that in the console log.
```sh

    {
        "total":0,
        "entries":[]
    }

```

### Settings / Options

The following parameter can be added to the directive:

* unique-name (optional -name for the broadcast event)
* ctrl (optional - change or add more functionality to the directive)
* rest-url (required -data-url for getting the data)
* rest-delete-url (optional - for an other delete request)
* template-url (optional - template url)
* title-value (optional - title value for the list)
* identity-value (optional - standard: id)
* entries-per-page  (optional - standard: 25)
* detail-route (optional - router-ui state)

You can find an example in the demo folder.

License
----
MIT