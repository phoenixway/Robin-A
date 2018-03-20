'use strict'
const {
   app, 
   BrowserWindow, 
   Menu
} = require('electron') 
const url = require('url') 
const path = require('path')  
const {ipcMain} = require('electron')

let win  

function createWindow() { 
   win = new BrowserWindow({
   		width: 800, 
   		height: 650,
   		icon: path.join(__dirname, 'images/robin-a.png'),
      show: false
   	}) 
   win.loadURL(url.format ({ 
      pathname: path.join(__dirname, 'index.html'), 
      protocol: 'file:', 
      slashes: true 
   })) 
   win.webContents.on('did-finish-load',function(){
    win.show()
    win.focus()
   })

}  

ipcMain.on('close', (event) => {
   win.close()
})

app.on('ready', createWindow) 

const template = [
  {
    label: 'App',
    submenu: [
      {
         label: 'Workspace',
         submenu: [
            {
               label: 'Save workspace',
               role: 'save workspace',
               accelerator: 'Ctrl+S',
               click (item, focusedWindow) {
                  win.webContents.send('menuClicked', 'saveWorkspace')
               }
            }
         ]
      },
      {
         label: 'Logout',
         accelerator: 'Ctrl+F4',
         click (item, focusedWindow) {
            //TODO
         }
      },
      {
        type: 'separator'
      },      
      {
         label: 'Exit',
         role: 'quit',
         accelerator: 'Alt+F4',
         click (item, focusedWindow) {
            if (focusedWindow) win.close()
         }
      }
    ]
  },
  {
    label: 'AI',
    submenu: [
      {
         label: 'Open prolog script..',
         role: 'open prolog script',
         click (item, focusedWindow) {
            //TODO
         }
      }, 
      {
         label: 'Run control script',
         accelerator: 'Ctrl+Alt+W',
         role: 'run control script',
         click (item, focusedWindow) {
            win.webContents.send('menuClicked', 'runControlScript')
         }
      }
    ]
  },
  {
    label: 'Setup',
    submenu: [
      {
         label: 'Toggle debug messages',
         role: 'toggle debug messages',
         type: 'checkbox',
         checked: true,
         click (item, focusedWindow) {
            win.webContents.send('menuClicked', 'showDebugMessages')
         }        
      },
      {
        type: 'separator'
      },
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click (item, focusedWindow) {
          if (focusedWindow) focusedWindow.reload()
        }
      },
      {
        label: 'Toggle Developer Tools',
        type: 'checkbox',
        accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
        click (item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.toggleDevTools()
        }
      },
      {
        type: 'separator'
      },
      {
        role: 'resetzoom'
      },
      {
        role: 'zoomin'
      },
      {
        role: 'zoomout'
      },
      {
        type: 'separator'
      },
      {
        role: 'togglefullscreen'
      }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
         label: "Tutorial",
         click () { 
         require('electron').shell.openExternal('http://electron.atom.io') 
         }
      },
      {
         label: "App's site",
         click () { 
         require('electron').shell.openExternal('http://electron.atom.io') 
         }
      },
      {
         label: "Author's site",
         click () { 
            require('electron').shell.openExternal('http://electron.atom.io') 
         }
      },
      {
        type: 'separator'
      },
      {
         label: 'About',
         click () { 
               win.webContents.send('menuClicked', 'about')
         }
      }
    ]
  }
]

if (process.platform === 'darwin') {
  const name = app.getName()
  template.unshift({
    label: name,
    submenu: [
      {
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        role: 'hide'
      },
      {
        role: 'hideothers'
      },
      {
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        role: 'quit'
      }
    ]
  })
  // Edit menu.
  template[1].submenu.push(
    {
      type: 'separator'
    },
    {
      label: 'Speech',
      submenu: [
        {
          role: 'startspeaking'
        },
        {
          role: 'stopspeaking'
        }
      ]
    }
  )
  // Window menu.
  template[3].submenu = [
    {
      label: 'Close',
      accelerator: 'CmdOrCtrl+W',
      role: 'close'
    },
    {
      label: 'Minimize',
      accelerator: 'CmdOrCtrl+M',
      role: 'minimize'
    },
    {
      label: 'Zoom',
      role: 'zoom'
    },
    {
      type: 'separator'
    },
    {
      label: 'Bring All to Front',
      role: 'front'
    }
  ]
}

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)