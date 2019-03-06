import verifySubselectors from './verifySubselectors'

export function impureFinalPropsSelectorFactory(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps,
    store
) {
    return function impureFinalPropsSelector(state, ownProps) {
        return mergeProps(
            mapStateToProps(store, ownProps),
            mapDispatchToProps(store, ownProps),
            ownProps
        )
    }
}

export function pureFinalPropsSelectorFactory(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps,
    store,
    { areStatesEqual, areOwnPropsEqual, areStatePropsEqual }
) {
    let hasRunAtLeastOnce = false
    let state
    let ownProps
    let stateProps
    let dispatchProps
    let mergedProps

    function handleFirstCall(firstState, firstOwnProps) {
        state = firstState
        ownProps = firstOwnProps
        stateProps = mapStateToProps(store, ownProps)
        dispatchProps = mapDispatchToProps(store, ownProps)
        mergedProps = mergeProps(stateProps, dispatchProps, ownProps)
        hasRunAtLeastOnce = true
        return mergedProps
    }

    function handleNewPropsAndNewState() {
        stateProps = mapStateToProps(store, ownProps)

        if (mapDispatchToProps.dependsOnOwnProps)
            dispatchProps = mapDispatchToProps(store, ownProps)

        mergedProps = mergeProps(stateProps, dispatchProps, ownProps)
        return mergedProps
    }

    function handleNewProps() {
        if (mapStateToProps.dependsOnOwnProps) stateProps = mapStateToProps(store, ownProps)

        if (mapDispatchToProps.dependsOnOwnProps)
            dispatchProps = mapDispatchToProps(store, ownProps)

        mergedProps = mergeProps(stateProps, dispatchProps, ownProps)
        return mergedProps
    }

    function handleNewState() {
        const nextStateProps = mapStateToProps(store, ownProps)
        const statePropsChanged = !areStatePropsEqual(nextStateProps, stateProps)
        stateProps = nextStateProps

        if (statePropsChanged) mergedProps = mergeProps(stateProps, dispatchProps, ownProps)

        return mergedProps
    }

    function handleSubsequentCalls(nextState, nextOwnProps) {
        const propsChanged = !areOwnPropsEqual(nextOwnProps, ownProps)
        const stateChanged = !areStatesEqual(nextState, state)
        state = nextState
        ownProps = nextOwnProps

        if (propsChanged && stateChanged) return handleNewPropsAndNewState()
        if (propsChanged) return handleNewProps()
        if (stateChanged) return handleNewState()
        return mergedProps
    }

    return function pureFinalPropsSelector(state, nextOwnProps) {
        return hasRunAtLeastOnce
            ? handleSubsequentCalls(state, nextOwnProps)
            : handleFirstCall(state, nextOwnProps)
    }
}

// TODO: Add more comments

// If pure is true, the selector returned by selectorFactory will memoize its results,
// allowing connectAdvanced's shouldComponentUpdate to return false if final
// props have not changed. If false, the selector will always return a new
// object and shouldComponentUpdate will always return true.

export default function finalPropsSelectorFactory(
    store,
    { initMapStateToProps, initMapDispatchToProps, initMergeProps, ...options }
) {
    const { dispatch } = store
    const mapStateToProps = initMapStateToProps(dispatch, options)
    const mapDispatchToProps = initMapDispatchToProps(dispatch, options)
    const mergeProps = initMergeProps(dispatch, options)

    if (process.env.NODE_ENV !== 'production') {
        verifySubselectors(mapStateToProps, mapDispatchToProps, mergeProps, options.displayName)
    }

    const selectorFactory = options.pure
        ? pureFinalPropsSelectorFactory
        : impureFinalPropsSelectorFactory

    return selectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, store, options)
}