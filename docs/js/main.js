window.addEventListener('DOMContentLoaded', async (event) => {
    console.debug('DOMContentLoaded!!');
    const url = new URL(location.href)
    if (url.searchParams.has('code') && url.searchParams.get('domain')) { // マストドンAPI oauth/authorize でリダイレクトされた場合
        const domain = url.searchParams.get('domain') // mstdn.jp / pawoo.net
        const tooter = new Tooter(domain)
        const code = url.searchParams.get('code')
        // 認証コード(code)をURLパラメータから削除する
        const params = url.searchParams;
        params.delete('code');
        history.replaceState('', '', url.pathname);
        // トークンを取得して有効であることを確認しトゥートする
        const status = sessionStorage.getItem(`status`)
        console.debug('----- authorized -----')
        console.debug('client_id:', sessionStorage.getItem(`${domain}-client_id`))
        console.debug('client_secret:', sessionStorage.getItem(`${domain}-client_secret`))
        console.debug('認証コード', code)
        // client_id, client_secretはsessionStorageに保存しておく必要がある
        const json = await tooter.getToken(sessionStorage.getItem(`${domain}-client_id`), sessionStorage.getItem(`${domain}-client_secret`), code)
        console.debug(json)
        console.debug('access_token:', json.access_token)
        sessionStorage.setItem(`${domain}-access_token`, json.access_token);
        const accessToken = json.access_token
        const v = await tooter.verify(accessToken)
        console.debug(v)
        const res = await tooter.toot(accessToken)
        console.debug(res)
        document.getElementById('res').value = JSON.stringify(res)
        sessionStorage.removeItem(`status`)
        console.debug('----- 以上 -----')
    }
    for (const button of document.querySelectorAll(`.toot-button[data-instance]`)) {
        console.log(button)
        console.log(button.dataset)
        button.addEventListener('click', async(event) => {
            console.debug(event.target)
            console.debug(event.target.dataset)
            console.debug(event.target.dataset.instance)
            const domain = event.target.dataset.instance
            console.log(domain)
            const tooter = new Tooter(domain)
            const access_token = sessionStorage.getItem(`${domain}-access_token`)
            if (access_token && tooter.verify(access_token)) {
                console.debug('既存のトークンが有効なため即座にトゥートします。');
                const res = await tooter.toot(access_token)
                console.debug(res)
                document.getElementById('res').value = JSON.stringify(res)
            } else {
                console.debug('既存のトークンがないか無効のため、新しいアクセストークンを発行します。');
                const app = await tooter.createApp()
                sessionStorage.setItem(`${domain}-client_id`, app.client_id);
                sessionStorage.setItem(`${domain}-client_secret`, app.client_secret);
                sessionStorage.setItem(`status`, document.getElementById('status').value);
                console.debug(app)
                console.debug(app.client_id)
                console.debug(app.client_secret)
                console.debug(sessionStorage.getItem(`${domain}-client_id`))
                console.debug(sessionStorage.getItem(`${domain}-client_secret`))
                tooter.authorize(app.client_id)
            }
        });
    }
});
window.addEventListener('beforeunload', (event) => {
    console.debug('beforeunload!!');
});

