# Anew Provider

> A small util for providing and connecting store to application.

## Table of Contents

-   [Installation](#installation)
-   [Usage](#usage)
-   [Parameters](#parameters)

## Installation

To install `anew` directly into your project run:

```
npm i @anew/provider -S
```

for yarn users, run:

```
yarn add @anew/provider
```

## Usage

```jsx
import React from 'react'
import Store from '@anew/store'
import Provider from '@anew/provider'
import Router from '@anew/router'

class App extends React.Component {
    static mapStateToProps = select => ({
        count: select.count(),
    })

    static mapDispatchToProps = dispatch => ({
        inc: dispatch.reducers.inc(),
    })

    render() {
        // Access Connected Props
        const { count, inc } = this.props

        return (
            <center>
                <span>{count}</span>
                <hr />
                <button onClick={inc}>INC</button>
            </center>
        )
    }
}

// Connect App to Store
const ConnectedApp = Provider.connect(App)

// Create App Core Store
// See @anew/store for more on Store
const AppStore = Store({
    name: 'core',

    state: {
        count: 1,
    },

    reducers: {
        inc: state => ({
            count: state.count + 1,
        }),
    },

    selectors: {
        count: store => store.create(state => state.count),
    },
})

// Share AnewStore with entire App
Provider.store(AppStore)

// Mount wrapped App to DOM
// You can also optionally provide
// an Anew Router that wraps App as well
// See @anew/router for more on Router
Provider.wrap(ConnectedApp, { id: 'root', Router })
```

## Parameters

```js
Provider.wrap(
    Component: ReactComponent,
    {
        id: String,
        Router: AnewRouterObject,
        Provider: ReactComponent,
    }
)
```

`Component`: Entry react component to Application.

`id`: DOM id to mount wrapped react component to.

`Router`: Anew Router Object that wraps the `Component` along with the provider.

`Provider`: A react provider that get passed the store as a prop.

The wrap method returns the `Component` wrapped around the provider with the configured store. This could be used with any component that you want to access some store. Most often, this method is used to provide the application's root store to the entire application. Note, you should not pass the id parameter to wrap a sub component from the appliation as that attempts to mount the component to the DOM at the provided element `id`.

```js
import Provider, { ProviderCore } from '@anew/provider'


class TodoComponent {...}
class EntryComponent {...}

// Alternative:
// const TodoProvider = new ProviderCore()
// TodoProvider.store(todoStore)
const TodoProvider = new ProviderCore(todoStore)

TodoProvider.wrap(TodoComponent) /* => (
    <Provider>
        <TodoComponent />
    </Provider>
)*/

Provider.store(rootStore)

Provider.wrap(EntryComponent, { id: 'root' }) /* => {
    ReactDOM.render((
        <Provider>
            <EntryComponent />
        </Provider>
    ), document.getElementById('root'))

    return (
        <Provider>
            <EntryComponent />
        </Provider>
    )
}*/
```

```js
Provider.connect(Component || Object)
```

This connect method is not different to the [react-redux connect](https://github.com/reduxjs/react-redux/blob/master/docs/api.md#connect) except that it passes an addition parameter to `mapStateToProps` which is the provided store's `getState` method for accessing anew store selectors.

```js
Provider.store(StoreObject)
```

An anew or redux store object. See [redux provider](https://github.com/reduxjs/react-redux/blob/master/docs/api.md#provider) for more information.