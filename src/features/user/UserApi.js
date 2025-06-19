export function fetchLoggedInUserOrders() {
	return new Promise(async (resolve) => {
		const response = await fetch('/api/v1/orders/own/');
		const data = await response.json();
		resolve({data});
	});
}

// export function fetchLoggedInUser() {
// 	return new Promise(async (resolve) => {
// 		const response = await fetch('/api/v1/users/own');
// 		const data = await response.json();
// 		// console.log('data= ', data);
// 		resolve({data});
// 	});
// }

export function fetchLoggedInUser() {
	return new Promise(async (resolve, reject) => {
		try {
			const response = await fetch('/api/v1/users/own');

			// console.log('response is-> ', response);
			if (!response.ok) {
				const error = await response.json();
				reject(error);
				return;
			}
			const data = await response.json();
			resolve({data});
		} catch (err) {
			reject(err);
		}
	});
}

export function updateUser(update) {
	// console.log('update was- ', update);
	return new Promise(async (resolve) => {
		const response = await fetch('/api/v1/users/' + update.id, {
			method: 'PATCH',
			body: JSON.stringify(update),
			headers: {'content-type': 'application/json'},
		});
		const data = await response.json();
		// TODO: on server it will only return some info of user (not password)
		resolve({data});
	});
}
