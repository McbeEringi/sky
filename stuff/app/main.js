const{
	app,
	Menu,
	BrowserWindow
}=require('electron'),
init=()=>{
	Menu.setApplicationMenu(Menu.buildFromTemplate([
		{role:'appMenu'},
		{role:'fileMenu'},
		{role:'editMenu'},
		{role:'viewMenu'},
		{role:'windowMenu'},
		{
			role:'help',
			submenu:[
				{
					label:'website',
					click:()=>{
						const win=new BrowserWindow({
							show:false//, frame: false
						});
						win.once('ready-to-show',()=>win.show());
						win.loadURL('https://mcbeeringi.github.io/');
					}
				},
				{
					label:'test',
					click:init
				}
			]
		}
	]));
	const win=new BrowserWindow({
		backgroundColor:'#214',
		titleBarStyle:'hidden',autoHideMenuBar:true,show:false,//kiosk:true,
		webPreferences:{devTools:false}
	});
	win.once('ready-to-show',()=>win.show());
	win.loadURL(`file://${__dirname}/index.html`);
};

app.on('ready',init);
app.on('window-all-closed',app.quit);
