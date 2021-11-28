import { actions } from './redux-store';

const API_BASE = 'http://localhost:5000'


const fetchUserIdsWithRetry = (retries = 5) => (dispatch) => {
  return new Promise((resolve, reject) => {
    fetchUserIds(retries, dispatch).then(resolve).catch((error) => {
        if(retries === 1){
          dispatch({
            type: actions.FETCH_USERS_ERROR,
          });
        } else {
          setTimeout(() => dispatch(fetchUserIdsWithRetry(retries-1)), 10000);
        }
      }
    );
  })
}

const fetchUserIds = (retries, dispatch) => {
  return fetch(`${API_BASE}/user_ids`).then((response) => {
    if(response.ok){
      return response.json();
    }
    if (response.status >= 500 && retries !== 1 ) {
      return setTimeout(() => fetchUserIds(retries-1), 10000);
    }
    return dispatch({
      type: actions.FETCH_USERS_ERROR,
    })
  }, err => {
    throw err
  }).then(data => {
    return dispatch({
      type: actions.FETCH_USERS_SUCCESS,
      payload: data
    })
  }, err => {
    throw err
  })
}

const fetchAddresses = (userId) => (dispatch) => {
  return fetch(`${API_BASE}/users/${userId}/addresses`).then((response) => {
    if (!response.ok) {
      return dispatch({
        type: actions.FETCH_ADDRESS_ERROR,
      });
    }

    return response.json();
  }, err => {
    throw err
  }).then(data => {
    return dispatch({
      type: actions.FETCH_ADDRESS_SUCCESS,
      payload: data
    });
  }, err => {
    return dispatch({
      type: actions.FETCH_ADDRESS_ERROR
    });
  });
}

const fetchEvents = (addressId) => (dispatch) => {
  return fetch(`${API_BASE}/addresses/${addressId}/events`).then((response) => {
    if (!response.ok) {
      return dispatch({
        type: actions.FETCH_EVENTS_ERROR,
      })
    }

    return response.json()
  }, err => {
    throw err
  }).then(data => {
    return dispatch({
      type: actions.FETCH_EVENTS_SUCCESS,
      payload: data
    })
  }, err => {
    return dispatch({
      type: actions.FETCH_EVENTS_ERROR
    })
  })
}

const fetchSelectedEventDetails = () => (dispatch, getState) => {
  const { selectedEvents, events } = getState()
  return Promise.all(
    events.filter(event => {
      return !!selectedEvents[event.created_at + '-' + event.id]
    }).map(event => {
      return fetch(API_BASE + event.url).then((response) => {
        if (!response.ok) {
          throw new Error('Failed request');
        }
        return response.json()
      }, err => {
        throw err
      })
    })
  ).then(values => {
    return dispatch({
      type: actions.EVENT_DETAILS_SUCCESS,
      payload: values
    })
  }).catch(err => {
    return dispatch({
      type: actions.EVENT_DETAILS_ERROR,
      payload: err
    })
  })
}

export { fetchUserIds, fetchAddresses, fetchEvents, fetchSelectedEventDetails, fetchUserIdsWithRetry }
