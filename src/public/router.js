window.addEventListener('load', () => {
    console.log('Window Loaded... Ready for JS')

   function Router (name, routes) {
        this.name = name
        this.routes = routes
    };
    
    let myFirstRouter = new Router('myFirstRouter', [
        {
            path: '/',
            name: 'Root'
        },
        {
            path: '/about',
            name: 'About'
        },
        {
            path: '/contact',
            name: 'Contact'
        }
    ]);

    console.log(myFirstRouter);

    let currentPath = window.location.pathname;
    console.log(currentPath)
})


