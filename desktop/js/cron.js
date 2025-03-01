/* This file is part of Jeedom.
 *
 * Jeedom is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Jeedom is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Jeedom. If not, see <http://www.gnu.org/licenses/>.
 */

"use strict"

if (!jeeFrontEnd.cron) {
  jeeFrontEnd.cron = {
    init: function() {
      window.jeeP = this
      this.tableCron = document.getElementById('table_cron')
      this.printCron()
      this.printListener()
      jeedomUtils.initTableSorter(false)
      this.tableCron.config.widgetOptions.resizable_widths = ['50px', '65px', '52px', '100px', '80px', '', '', '', '115px', '148px', '120px', '60px', '90px']
      this.tableCron.triggerEvent('applyWidgets')
      this.tableCron.triggerEvent('resizableReset')

      this.getDeamonState()

      domUtils(function() {
        jeeFrontEnd.cron.tableCron.querySelector('thead tr').children[0].triggerEvent('sort')

        if (document.getElementById('tab_tableCron').hasClass('active')) {
          document.querySelector('div.floatingbar').seen()
        } else {
          document.querySelector('div.floatingbar').unseen()
        }
      })
    },
    //-> Cron
    printCron: function() {
      jeedom.cron.all({
        success: function(data) {
          domUtils.showLoading()
          var table = document.getElementById('table_cron').querySelector('tbody')
          table.empty()
          for (var i in data) {
            let newRow = document.createElement("tr")
            newRow.innerHTML = jeeP.addCron(data[i])
            newRow.setJeeValues(data[i], '.cronAttr')
            table.appendChild(newRow)
          }
          jeeP.tableCron.triggerEvent("update")
          jeeFrontEnd.modifyWithoutSave = false
          setTimeout(function() {
            jeeFrontEnd.modifyWithoutSave = false
          }, 1000)
          domUtils.hideLoading()
        }
      })
    },
    addCron: function(_cron) {
      jeedomUtils.hideAlert()
      var disabled = ''
      if (init(_cron.deamon) == 1) {
        disabled = 'disabled'
      }
      var tr = '<tr>'
      tr += '<td><span class="cronAttr label label-info" data-l1key="id"></span></td>'
      tr += '<td class="center">'
      tr += '<input type="checkbox"class="cronAttr" data-l1key="enable" checked ' + disabled + '/>'
      tr += '</td>'
      tr += '<td>'
      tr += init(_cron.pid)
      tr += '</td>'
      tr += '<td class="center">'
      tr += '<input type="checkbox" class="cronAttr" data-l1key="deamon" ' + disabled + ' /></span> '
      tr += '<input class="cronAttr input-xs" data-l1key="deamonSleepTime" style="width : 50px;" />'
      tr += '</td>'
      tr += '<td class="center">'
      if (init(_cron.deamon) == 0) {
        tr += '<input type="checkbox" class="cronAttr" data-l1key="once" /></span> '
      }
      tr += '</td>'
      tr += '<td><input class="form-control cronAttr input-sm" data-l1key="class" ' + disabled + ' /></td>'
      tr += '<td><input class="form-control cronAttr input-sm" data-l1key="function" ' + disabled + ' /></td>'
      tr += '<td><input class="form-control cronAttr input-sm" data-l1key="schedule" ' + disabled + ' /></td>'
      tr += '<td>'
      if (init(_cron.deamon) == 0) {
        tr += '<input class="form-control cronAttr input-sm" data-l1key="timeout" />'
      }
      tr += '</td>'
      tr += '<td>'
      tr += init(_cron.lastRun)
      tr += '</td>'
      tr += '<td>'
      tr += init(_cron.runtime, '0') + 's'
      tr += '</td>'
      tr += '<td>'
      var label = 'label label-info'
      var state = init(_cron.state)
      if (init(_cron.state) == 'run') {
        label = 'label label-success'
        state = '{{En cours}}'
      }
      if (init(_cron.state) == 'stop') {
        label = 'label label-danger'
        state = '{{Arrêté}}'
      }
      if (init(_cron.state) == 'starting') {
        label = 'label label-warning'
        state = '{{Démarrage}}'
      }
      if (init(_cron.state) == 'stoping') {
        label = 'label label-warning'
        state = '{{Arrêt}}'
      }
      tr += '<span class="' + label + '">' + state + '</span>'
      tr += '</td>'

      tr += '<td>'
      if (init(_cron.id) != '') {
        tr += '<a class="btn btn-xs display" title="{{Détails de cette tâche}}"><i class="fas fa-file"></i></a> '
      }
      if (init(_cron.deamon) == 0) {
        if (init(_cron.state) == 'run') {
          tr += ' <a class="btn btn-danger btn-xs stop" title="{{Arrêter cette tâche}}"><i class="fas fa-stop"></i></a>'
        }
        if (init(_cron.state) != '' && init(_cron.state) != 'starting' && init(_cron.state) != 'run' && init(_cron.state) != 'stoping') {
          tr += ' <a class="btn btn-xs btn-success start" title="{{Démarrer cette tâche}}"><i class="fas fa-play"></i></a>'
        }
      }
      tr += ' <a class="btn btn-danger btn-xs" title="{{Supprimer cette tâche}}"><i class="icon maison-poubelle remove"></i></a>'
      tr += '</td>'
      tr += '</tr>'
      return tr
    },
    //-> Listeners
    printListener: function() {
      jeedom.listener.all({
        success: function(data) {
          domUtils.showLoading()
          var table = document.getElementById('table_listener').querySelector('tbody')
          table.empty()
          for (var i in data) {
            let newRow = document.createElement("tr")
            newRow.innerHTML = jeeP.addListener(data[i])
            newRow.setJeeValues(data[i], '.listenerAttr')
            table.appendChild(newRow)
          }
          jeeFrontEnd.modifyWithoutSave = false
          domUtils.hideLoading()
        }
      })
    },
    addListener: function(_listener) {
      jeedomUtils.hideAlert()
      var disabled = ''
      var tr = '<tr>'
      tr += '<td class="option"><span class="listenerAttr" data-l1key="id"></span></td>'
      tr += '<td>'
      if (init(_listener.id) != '') {
        tr += '<a class="btn btn-xs display"><i class="fas fa-file"></i></a> '
      }
      tr += '</td>'
      tr += '<td><textarea class="form-control listenerAttr input-sm" data-l1key="event_str" disabled ></textarea></td>'
      tr += '<td><input class="form-control listenerAttr input-sm" data-l1key="class" disabled /></td>'
      tr += '<td><input class="form-control listenerAttr input-sm" data-l1key="function" disabled /></td>'
      tr += '<td><a class="btn btn-danger btn-xs removeListener pull-right" title="{{Supprimer cette tâche}}"><i class="icon maison-poubelle"></i></a></td>'
      tr += '</tr>'
      return tr
    },
    //-> Daemons
    getDeamonState: function() {
      document.querySelector('#table_deamon tbody').empty()
      jeedom.plugin.all({
        activateOnly: true,
        error: function(error) {
          jeedomUtils.showAlert({
            message: error.message,
            level: 'danger'
          })
        },
        success: function(plugins) {
          for (var i in plugins) {
            if (plugins[i].hasOwnDeamon == 0) continue

            jeedom.plugin.getDeamonInfo({
              id: plugins[i].id,
              async: false,
              error: function(error) {
                jeedomUtils.showAlert({
                  message: error.message,
                  level: 'danger'
                })
              },
              success: function(deamonInfo) {
                var html = '<tr>'
                html += '<td>'
                html += deamonInfo.plugin.name
                html += '</td>'
                html += '<td>'
                if (deamonInfo.state == 'ok') {
                  html += '<span class="label label-success">OK</span>'
                } else {
                  html += '<span class="label label-danger">' + deamonInfo.state.toUpperCase() + '</span>'
                }
                html += '</td>'
                html += '<td>'
                html += deamonInfo.last_launch
                html += '</td>'
                html += '<td>'
                html += '<a class="bt_deamonAction btn btn-xs btn-success" data-action="start" title="{{Démarrer ou re-démarrer}}" data-plugin="' + deamonInfo.plugin.id + '"><i class="fas fa-play"></i></a> '
                if (deamonInfo.auto == 0) {
                  html += '<a class="bt_deamonAction btn btn-xs btn-danger" data-action="stop" title="{{Arrêter}}" data-plugin="' + deamonInfo.plugin.id + '"><i class="fas fa-stop"></i></a> '
                  html += '<a class="bt_deamonAction btn btn-xs btn-warning" data-action="enableAuto" title="{{Activer la gestion automatique du démon}}" data-plugin="' + deamonInfo.plugin.id + '"><i class="fas fa-magic"></i></a> '
                } else {
                  html += '<a class="bt_deamonAction btn btn-xs btn-warning" data-action="disableAuto" title="{{Désactiver la gestion automatique du démon}}" data-plugin="' + deamonInfo.plugin.id + '"><i class="fas fa-times"></i></a> '
                }
                html += '</td>'
                html += '</tr>'
                document.getElementById('table_deamon').querySelector('tbody').insertAdjacentHTML('beforeend', html)
              }
            })
          }
        }
      })
    },
    //Save
    saveCron: function() {
      jeedom.cron.save({
        crons: document.querySelectorAll('#table_cron tbody tr').getJeeValues('.cronAttr'),
        error: function(error) {
          jeedomUtils.showAlert({
            message: error.message,
            level: 'danger'
          })
        },
        success: function() {
          jeeP.printCron()
        }
      })
    },
  }
}

jeeFrontEnd.cron.init()

//Manage events outside parents delegations:
document.getElementById('bt_refreshCron')?.addEventListener('click', function(event) {
  jeeP.printCron()
  jeeP.printListener()
})

document.getElementById('bt_addCron')?.addEventListener('click', function(event) {
  let table = document.getElementById('table_cron').tBodies[0]
  let newRow = document.createElement("tr")
  newRow.innerHTML = jeeP.addCron({})
  newRow.setJeeValues({}, '.cronAttr')
  table.appendChild(newRow)
  jeeP.tableCron.triggerEvent("update")
  jeeFrontEnd.modifyWithoutSave = true
})

document.getElementById('bt_save')?.addEventListener('click', function(event) {
  jeeFrontEnd.cron.saveCron()
})

document.getElementById('bt_changeCronState')?.addEventListener('click', function(event) {
  var _target = event.target
  jeedom.config.save({
    configuration: {
      enableCron: _target.getAttribute('data-state')
    },
    error: function(error) {
      jeedomUtils.showAlert({
        message: error.message,
        level: 'danger'
      })
    },
    success: function() {
      if (_target.getAttribute('data-state') == '1') {
        _target.removeClass('btn-success').addClass('btn-danger').setAttribute('data-state', '0')
        _target.innerHTML = '<i class="fas fa-times"></i> {{Désactiver le système cron}}'
      } else {
        _target.removeClass('btn-danger').addClass('btn-success').setAttribute('data-state', '1')
        _target.innerHTML = '<i class="fas fa-check"></i> {{Activer le système cron}}</a>'
      }
    }
  })
})

document.getElementById('bt_refreshDeamon')?.addEventListener('click', function(event) {
  jeeP.getDeamonState()
})

//Specials
document.registerEvent('keydown', function(event) {
  if (jeedomUtils.getOpenedModal()) return
  if ((event.ctrlKey || event.metaKey) && event.which == 83) { //s
    event.preventDefault()
    jeeFrontEnd.cron.saveCron()
  }
})

/*Events delegations
*/
document.getElementById('div_pageContainer').addEventListener('click', function(event) {
  var _target = null
  if (_target = event.target.closest('ul.nav.nav-tabs')) {
    if (document.getElementById('tab_tableCron').hasClass('active')) {
      document.querySelector('div.floatingbar').seen()
    } else {
      document.querySelector('div.floatingbar').unseen()
    }
    return
  }
})

document.getElementById('div_pageContainer').addEventListener('change', function(event) {
  var _target = null
  if (_target = event.target.closest('.cronAttr')) {
    jeeFrontEnd.modifyWithoutSave = true
  }
})


//Table cron
document.getElementById('table_cron')?.tBodies[0].addEventListener('click', function(event) {
  var _target = null
  if (_target = event.target.closest('.remove')) {
    _target.closest('tr').remove()
    return
  }

  if (_target = event.target.closest('.stop')) {
    jeedom.cron.setState({
      state: 'stop',
      id: _target.closest('tr').querySelector('span[data-l1key="id"]').innerHTML,
      error: function(error) {
        jeedomUtils.showAlert({
          message: error.message,
          level: 'danger'
        })
      },
      success: function() {
        jeeP.printCron()
      }
    })
    return
  }

  if (_target = event.target.closest('.start')) {
    jeedom.cron.setState({
      state: 'start',
      id: _target.closest('tr').querySelector('span[data-l1key="id"]').innerHTML,
      error: function(error) {
        jeedomUtils.showAlert({
          message: error.message,
          level: 'danger'
        })
      },
      success: function() {
        jeeP.printCron()
      }
    })
    return
  }

  if (_target = event.target.closest('.display')) {
    jeeDialog.dialog({
      id: 'jee_modal',
      title: "{{Détails du cron}}",
      contentUrl: 'index.php?v=d&modal=object.display&class=cron&id=' + _target.closest('tr').querySelector('span[data-l1key="id"]').innerHTML
    })
    return
  }
})

document.getElementById('table_cron')?.tBodies[0].addEventListener('change', function(event) {
  var _target = null
  if (_target = event.target.closest('.cronAttr[data-l1key="deamon"]')) {
    if (_target.jeeValue() == 1) {
      _target.closest('tr').querySelector('.cronAttr[data-l1key="deamonSleepTime"]').seen()
    } else {
      _target.closest('tr').querySelector('.cronAttr[data-l1key="deamonSleepTime"]').unseen()
    }
    return
  }
})



//Table listeners
document.getElementById('table_listener')?.tBodies[0].addEventListener('click', function(event) {
  var _target = null
  if (_target = event.target.closest('.display')) {
    jeeDialog.dialog({
      id: 'jee_modal',
      title: "{{Détails du listener}}",
      contentUrl: 'index.php?v=d&modal=object.display&class=listener&id=' + _target.closest('tr').querySelector('span[data-l1key="id"]').innerHTML
    })
    return
  }

  if (_target = event.target.closest('.removeListener')) {
    jeedom.listener.remove({
      id: _target.getAttribute('id'),
      success: function() {
        tr.remove()
      }
    })
    return
  }
})

//Table daemons
document.getElementById('table_deamon')?.tBodies[0].addEventListener('click', function(event) {
  var _target = null
  if (_target = event.target.closest('.bt_deamonAction')) {
    var plugin = _target.getAttribute('data-plugin')
    var action = _target.getAttribute('data-action')
    if (action == 'start') {
      jeedom.plugin.deamonStart({
        id: plugin,
        forceRestart: 1,
        error: function(error) {
          jeedomUtils.showAlert({
            message: error.message,
            level: 'danger'
          })
        },
        success: function() {
          jeeP.getDeamonState()
        }
      })
    } else if (action == 'stop') {
      jeedom.plugin.deamonStop({
        id: plugin,
        error: function(error) {
          jeedomUtils.showAlert({
            message: error.message,
            level: 'danger'
          })
        },
        success: function() {
          jeeP.getDeamonState()
        }
      })
    } else if (action == 'enableAuto') {
      jeedom.plugin.deamonChangeAutoMode({
        id: plugin,
        mode: 1,
        error: function(error) {
          jeedomUtils.showAlert({
            message: error.message,
            level: 'danger'
          })
        },
        success: function() {
          jeeP.getDeamonState()
        }
      })
    } else if (action == 'disableAuto') {
      jeedom.plugin.deamonChangeAutoMode({
        id: plugin,
        mode: 0,
        error: function(error) {
          jeedomUtils.showAlert({
            message: error.message,
            level: 'danger'
          })
        },
        success: function() {
          jeeP.getDeamonState()
        }
      })
    }
    return
  }
})
