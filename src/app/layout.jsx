import "./globals.css"

export const metadata = {
    title: 'FitTime',
    description: 'Your fitness app'
};

export default function Layout({children}) {
    return (
        <html lang="en">
            <head>
                <meta httpEquiv="Content-Type" content="text/html;charset=UTF-8"/>
                <link rel="preconnect" href="https://fonts.googleapis.com"/>
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true"/>
                <link
                    href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&display=swap"
                    rel="stylesheet"/>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
                <link rel="stylesheet" href="/richtexteditor/rte_theme_default.css" />
                <script type="text/javascript" src="/richtexteditor/rte.js"></script>
                <script type="text/javascript" src='/richtexteditor/plugins/all_plugins.js'></script>
            </head>
            <body>{children}</body>
        </html>
    );
}
