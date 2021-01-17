(function () {
    function Nav (current) {
        const sections = [{
            path: '/',
            name: 'PluriDB',
            html: `<div style="display:flex; gap:10px; align-items:center;">
                            <img style="height: 2rem;" alt="icon" src="${path('/static/img/PluriDB.svg')}"></img>
                            <span>PluriDB</span>
                        </div>`,
            hidden: false
        },
        {
            external: true,
            name: ''
        },
        {
            path: '/demo/',
            name: 'Demo',
            hidden: true
        },
        {
            path: '/docs/',
            name: 'Docs',
            hidden: true
        },
        {
            path: 'https://github.com/dandimrod/PluriDB',
            name: 'Git Repository',
            hidden: true,
            external: true
        }
        ];

        function path (target) {
            const source = current.startsWith('/') ? current.substring(1) : current;
            const sourceArr = source.split('/');
            let prePath = '';
            for (let index = 1; index < sourceArr.length; index++) {
                prePath += '../';
            }
            target = target.startsWith('/') ? target.substring(1) : target;
            return prePath + target;
        }

        function generateSections () {
            const tabNav = document.getElementById('nav');
            const tabMenu = document.createElement('div');
            tabMenu.className = 'nav-tab';
            tabMenu.onmouseleave = () => {
                positionIndicator(path(current));
            };
            tabNav.appendChild(tabMenu);
            for (let index = 0; index < sections.length; index++) {
                const section = sections[index];
                const a = document.createElement('a');
                const url = section.external ? section.path : path(section.path);
                a.href = url;
                a.className = `nav-link ${section.hidden ? 'hid' : ''}`;
                a.innerHTML = section.html ? section.html : `<span>${section.name}</span>`;
                a.onmouseover = () => {
                    positionIndicator(url);
                };
                tabMenu.appendChild(a);
            }
            const navIcon = document.createElement('div');
            navIcon.innerHTML = '<span></span> <span></span> <span></span>';
            navIcon.className = 'nav-icon';
            navIcon.onclick = () => {
                navIcon.classList.toggle('open');
                navTray.classList.toggle('open');
            };
            tabMenu.appendChild(navIcon);
            const navTray = document.createElement('div');
            navTray.className = 'nav-tray';
            tabNav.parentNode.insertBefore(navTray, tabNav.nextSibling);
            for (let index = 0; index < sections.length; index++) {
                const section = sections[index];
                if (section.hidden) {
                    const a = document.createElement('a');
                    const url = section.external ? section.path : path(section.path);
                    a.href = url;
                    a.className = `nav-link ${section.path === current ? 'selected' : ''}`;
                    a.innerHTML = section.html ? section.html : `<span>${section.name}</span>`;
                    navTray.appendChild(a);
                }
            }
            const indicator = document.createElement('span');
            indicator.className = 'nav-ind';
            tabNav.appendChild(indicator);
        }

        function positionIndicator (selectedSection) {
            const tabNavList = document.body.querySelector('.nav-tab');
            const tabNavCurrentLinkindicator = document.querySelector('.nav-ind');
            const tabNavListLeftPosition = tabNavList.getBoundingClientRect().left;
            const tabNavCurrentLinkText = tabNavList.querySelector(`[href='${selectedSection}'] span`);
            const tabNavCurrentLinkTextPosition = tabNavCurrentLinkText.getBoundingClientRect();
            tabNavCurrentLinkindicator.style.transform =
                `translate3d(${(tabNavCurrentLinkTextPosition.left - tabNavListLeftPosition)}px,0,0) scaleX(${tabNavCurrentLinkTextPosition.width * 0.01})`;
        }
        generateSections();
        window.addEventListener('load', () => {
            positionIndicator(path(current));
        });
    }
    window.Nav = Nav;
})();
