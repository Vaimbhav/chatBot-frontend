const BASE_URL = import.meta.env.VITE_BASE_URL;

export function sendChatMessage(data) {
    return new Promise((resolve, reject) => {
        (async () => {
            try {
                console.log('data is -> ', data);
                const response = await fetch('/api/v1/chat/', {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: {
                        'content-type': 'application/json',
                    },
                    credentials: 'include',
                });
                const result = await response.json();
                console.log(result);
                resolve({ data: result });
            } catch (error) {
                reject(error);
            }
        })();
    });
}

export function fetchChatHistory() {
    return new Promise((resolve, reject) => {
        (async () => {
            try {
                const response = await fetch('/api/v1/chat/history', {
                    method: 'GET',
                    credentials: 'include',
                });
                const result = await response.json();
                resolve({ data: result.chats });
            } catch (error) {
                reject(error);
            }
        })();
    });
}
