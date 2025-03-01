/* This file is part of Jeedom.
 *
 * Jeedom is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Jeedom is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Jeedom. If not, see <http://www.gnu.org/licenses/>.
 */

"use strict"

if (!jeeFrontEnd.display) {
  jeeFrontEnd.display = {
    actionMode: null,
    tableRemoveHistory: null,
    init: function() {
      window.jeeP = this
      this.actionMode = null
      this.tableRemoveHistory = document.getElementById('table_removeHistory')

      var checkContextMenuCallback = function(_el) {
        _el.trigger('change')
      }
      jeedomUtils.setCheckContextMenu(checkContextMenuCallback)
    },
    setRemoveHistoryTable: function() {
      jeedomUtils.initTableSorter()
      this.tableRemoveHistory.config.widgetOptions.resizable_widths = ['180px', '160px', '80px', '']
      this.tableRemoveHistory.triggerEvent('applyWidgets')
      this.tableRemoveHistory.triggerEvent('resizableReset')
      setTimeout(() => {
        this.tableRemoveHistory.querySelector('thead tr').children[0].triggerEvent('sort')
        this.tableRemoveHistory.querySelector('thead tr').children[0].triggerEvent('sort')
      }, 200)
      this.tableRemoveHistory.triggerEvent("update")
    },
    setEqActions: function() {
      var found = false
      for (var _cb of document.querySelectorAll('.cb_selEqLogic')) {
        if (_cb.checked) {
          found = true
          break
        }
      }
      if (found) {
        this.actionMode = 'eqLogic'
        document.querySelectorAll('.eqActions').seen()
        document.querySelectorAll('.cb_selCmd').unseen()
        document.getElementById('bt_removeEqlogic').seen()
        document.querySelectorAll('.bt_setIsVisible').seen()
        document.querySelectorAll('.bt_setIsEnable').seen()
      } else {
        this.actionMode = null
        document.querySelectorAll('.eqActions').unseen()
        document.querySelectorAll('.cb_selCmd').seen()
        document.getElementById('bt_removeEqlogic').unseen()
        document.querySelectorAll('.bt_setIsVisible').unseen()
        document.querySelectorAll('.bt_setIsEnable').unseen()
      }
    }
  }
}

jeeFrontEnd.display.init()

//searching
document.getElementById('in_search').addEventListener('keyup', function(event) {
  try {
    var search = event.target.value
    var searchID = search
    if (isNaN(search)) searchID = false

      console.log('search:', search, searchID)

    document.querySelectorAll('.panel-collapse.in').removeClass('in')
    document.querySelectorAll('.panel-collapse').forEach(_panel => { _panel.addClass('in').setAttribute('data-show', 0) })
    document.querySelectorAll('.cmd').seen().removeClass('alert-success').addClass('alert-info')
    document.querySelectorAll('.eqLogic').seen()
    document.querySelectorAll('.cmdSortable').unseen()
    if (search == '') {
      document.querySelectorAll('.panel-collapse.in').removeClass('in')
      return
    }
    if (!search.startsWith('*') && searchID == false) {
      if ((search == '' || jeephp2js._nbCmd_ <= 1500 && search.length < 3) || (jeephp2js._nbCmd_ > 1500 && search.length < 4)) {
        document.querySelectorAll('.panel-collapse.in').removeClass('in')
        return
      }
    } else {
      if (search == '*') return
    }
    search = jeedomUtils.normTextLower(search)
    var eqLogic, eqParent, eqId, cmd, cmdId
    var eqName, type, category, cmdName
    document.querySelectorAll('.eqLogic').forEach(_eq => {
      eqParent = _eq.closest('.panel.panel-default')
      if (searchID) {
        eqId = _eq.getAttribute('data-id')
        if (eqId != searchID) {
          _eq.unseen()
        } else {
          eqParent.querySelector('div.panel-collapse').addClass('in')
          return
        }
        _eq.querySelectorAll('.cmd').forEach(_cmd => {
          cmdId = _cmd.getAttributes('data-id')
          if (cmdId == searchID) {
            _cmd.closestAll('.panel-collapse').forEach(_panel => { _panel.setAttribute('data-show', '1') })
            _cmd.seen()
            _cmd.closest('ul.cmdSortable')?.seen()
            _cmd.closest('li.eqLogic').seen()
            _cmd.removeClass('alert-warning').addClass('alert-success')
            return
          }
        })
      } else {
        eqName = jeedomUtils.normTextLower(_eq.getAttribute('data-name'))
        type = jeedomUtils.normTextLower(_eq.getAttribute('data-type'))
        category = jeedomUtils.normTextLower(_eq.getAttribute('data-translate-category'))
        if (!eqName.includes(search) && !type.includes(search) && !category.includes(search)) {
          _eq.unseen()
        } else {
          _eq.closestAll('.panel-collapse').forEach(_panel => { _panel.setAttribute('data-show', '1') })
        }
        _eq.querySelectorAll('.cmd').forEach(_cmd => {
          cmdName = _cmd.getAttribute('data-name')
          cmdName = jeedomUtils.normTextLower(cmdName)
          if (cmdName.includes(search)) {
            console.log('got cmd: ',cmdName, _cmd)
            _cmd.closestAll('.panel-collapse').forEach(_panel => { _panel.setAttribute('data-show', '1') })
            _cmd.seen()
            _cmd.closest('ul.cmdSortable')?.seen()
            _cmd.closest('li.eqLogic').seen()
            _cmd.removeClass('alert-warning').addClass('alert-success')
          }
        })
      }
    })
    document.querySelectorAll('.panel-collapse[data-show="1"]').addClass('in')
    document.querySelectorAll('.panel-collapse[data-show="0"]').removeClass('in')
  } catch (error) {
    console.error(error)
  }
})
document.getElementById('bt_resetdisplaySearch').addEventListener('click', function(event) {
  document.getElementById('in_search').jeeValue('').triggerEvent('keyup')
})
document.getElementById('bt_openAll').addEventListener('click', function(event) {
  document.querySelectorAll('.panel-collapse').forEach(_panel => { _panel.addClass('in') })
  if (event.ctrlKey || event.metaKey) {
    document.querySelectorAll('.cmdSortable').seen()
  }
})
document.getElementById('bt_closeAll').addEventListener('click', function(event) {
  document.querySelectorAll('.panel-collapse').forEach(_panel => { _panel.removeClass('in') })
  if (event.ctrlKey || event.metaKey) {
    document.querySelectorAll('.cmdSortable').unseen()
  }
})

//Sorting:
$(document.getElementById('accordionObject')).sortable({
  cursor: "move",
  items: ".objectSortable",
  stop: function(event, ui) {
    var objects = []
    document.querySelectorAll('.objectSortable .panel-heading').forEach(_panel => {
      objects.push(_panel.getAttribute('data-id'))
    })
    jeedom.object.setOrder({
      objects: objects,
      error: function(error) {
        jeedomUtils.showAlert({
          message: error.message,
          level: 'danger'
        })
      }
    })
  }
}).disableSelection()

$(document.querySelectorAll('.eqLogicSortable')).sortable({
  cursor: "move",
  connectWith: ".eqLogicSortable",
  start: function(event, info) {
    //get checked eqlogics in this object:
    let me = info.item[0]
    let myId = me.getAttribute('data-id')
    me.closest('ul.eqLogicSortable').querySelectorAll(':scope > li.eqLogic.ui-sortable-handle').forEach(_eqlogic => {
      if (_eqlogic.getAttribute('data-id') == myId) return
      if (_eqlogic.hasClass('ui-sortable-placeholder')) return
      if (_eqlogic.querySelector('.cb_selEqLogic').checked) {
        me.appendChild(_eqlogic)
      }
    })
  },
  stop: function(event, info) {
    //set appended eqlogics:
    try {
      var me = info.item[0] //Back to htmlelement
      me.querySelectorAll('li.eqLogic').forEach(_eqlogic => {
        me.parentNode.appendChild(_eqlogic)
      })
    } catch (error) {
      console.warn('eqLogic sorting error:' + error)
      return
    }
    //set object order:
    var eqLogics = []
    var object = me.closest('.objectSortable')
    var objectId = object.querySelector('.panel-heading').getAttribute('data-id')
    var order = 1
    var eqLogic
    object.querySelectorAll('.eqLogic').forEach(_eq => {
      eqLogic = {}
      eqLogic.object_id = objectId
      eqLogic.id = _eq.getAttribute('data-id')
      eqLogic.order = order
      eqLogics.push(eqLogic)
      order++
    })
    jeedom.eqLogic.setOrder({
      eqLogics: eqLogics,
      error: function(error) {
        jeedomUtils.showAlert({
          message: error.message,
          level: 'danger'
        })
        $(".eqLogicSortable").sortable("cancel")
      }
    })
  }
}).disableSelection()

$(document.querySelectorAll('.cmdSortable')).sortable({
  cursor: "move",
  stop: function(event, info) {
    var me = info.item[0] //Back to htmlelement
    var cmds = []
    var eqLogic = me.closest('.eqLogic')
    var order = 1
    var cmd
    eqLogic.querySelectorAll('.cmd').forEach(_cmd => {
      cmd = {}
      cmd.id = _cmd.getAttribute('data-id')
      cmd.order = order
      cmds.push(cmd)
      order++
    })
    jeedom.cmd.setOrder({
      cmds: cmds,
      error: function(error) {
        jeedomUtils.showAlert({
          message: error.message,
          level: 'danger'
        })
      }
    })
  }
}).disableSelection()

/*Events delegations
*/
document.getElementById('div_pageContainer').addEventListener('click', function(event) {
  var _target = null
  if (_target = event.target.closest('[aria-controls="historytab"]')) {
    document.querySelector('div.eqActions').unseen()
    jeeP.setRemoveHistoryTable()
    return
  }

  if (_target = event.target.closest('[aria-controls="displaytab"]')) {
    if (jeeP.actionMode) document.querySelector('div.eqActions').seen()
    return
  }

  if (_target = event.target.closest('#bt_removeEqlogic')) {
    jeeDialog.confirm('{{Êtes-vous sûr de vouloir supprimer tous ces équipements ?}}', function(result) {
      if (result) {
        var eqLogics = []
        document.querySelectorAll('.cb_selEqLogic').forEach(_cb => {
          if (_cb.checked) {
            eqLogics.push(_cb.closest('.eqLogic').getAttribute('data-id'))
          }
        })
        jeedom.eqLogic.removes({
          eqLogics: eqLogics,
          error: function(error) {
            jeedomUtils.showAlert({
              message: error.message,
              level: 'danger'
            })
          },
          success: function() {
            jeedomUtils.loadPage('index.php?v=d&p=display')
          }
        })
      }
    })
    return
  }

  if (_target = event.target.closest('.bt_setIsVisible')) {
    if (jeeP.actionMode == 'eqLogic') {
      var eqLogics = []
      document.querySelectorAll('.cb_selEqLogic').forEach(_cb => {
        if (_cb.checked) {
          eqLogics.push(_cb.closest('.eqLogic').getAttribute('data-id'))
        }
      })
      jeedom.eqLogic.setIsVisibles({
        eqLogics: eqLogics,
        isVisible: event.target.getAttribute('data-value'),
        error: function(error) {
          jeedomUtils.showAlert({
            message: error.message,
            level: 'danger'
          })
        },
        success: function() {
          jeedomUtils.loadPage('index.php?v=d&p=display')
        }
      })
    }

    if (jeeP.actionMode == 'cmd') {
      var cmds = []
      document.querySelectorAll('.cb_selCmd').forEach(_cb => {
        if (_cb.checked) {
          eqLogics.push(_cb.closest('.cmd').getAttribute('data-id'))
        }
      })
      jeedom.cmd.setIsVisibles({
        cmds: cmds,
        isVisible: event.target.getAttribute('data-value'),
        error: function(error) {
          jeedomUtils.showAlert({
            message: error.message,
            level: 'danger'
          })
        },
        success: function() {
          jeedomUtils.loadPage('index.php?v=d&p=display')
        }
      })
    }
    return
  }

  if (_target = event.target.closest('.bt_setIsEnable')) {
    var eqLogics = []
    document.querySelectorAll('.cb_selEqLogic').forEach(_cb => {
      if (_cb.checked) {
        eqLogics.push(_cb.closest('.eqLogic').getAttribute('data-id'))
      }
    })
    jeedom.eqLogic.setIsEnables({
      eqLogics: eqLogics,
      isEnable: event.target.getAttribute('data-value'),
      error: function(error) {
        jeedomUtils.showAlert({
          message: error.message,
          level: 'danger'
        })
      },
      success: function() {
        jeedomUtils.loadPage('index.php?v=d&p=display')
      }
    })
    return
  }

  if (_target = event.target.closest('#bt_emptyRemoveHistory')) {
    jeeDialog.confirm('{{Êtes-vous sûr de vouloir vider l\'historique de suppression ?}}', function(result) {
      if (result) {
        jeedom.emptyRemoveHistory({
          error: function(error) {
            jeedomUtils.showAlert({
              message: error.message,
              level: 'danger'
            })
          },
          success: function(data) {
            document.getElementById('table_removeHistory').tBodies[0].empty()
            jeedomUtils.showAlert({
              message: '{{Historique vidé avec succès}}',
              level: 'success'
            })
          }
        })
      }
    })
    return
  }

  if (_target = event.target.closest('.configureObject')) {
    jeeDialog.dialog({
      id: 'jee_modal',
      title: "{{Configuration de l'objet}}",
      contentUrl: 'index.php?v=d&modal=object.configure&object_id=' + _target.closest('.panel-heading').getAttribute('data-id')
    })
    return
  }

  if (_target = event.target.closest('.configureEqLogic')) {
    jeeDialog.dialog({
      id: 'jee_modal',
      title: "{{Configuration de l'équipement}}",
      contentUrl: 'index.php?v=d&modal=eqLogic.configure&eqLogic_id=' + _target.closest('.eqLogic').getAttribute('data-id')
    })
    return
  }

  if (_target = event.target.closest('.configureCmd')) {
    jeeDialog.dialog({
      id: 'jee_modal2',
      title: '{{Configuration de la commande}}',
      contentUrl: 'index.php?v=d&modal=cmd.configure&cmd_id=' + _target.closest('.cmd').getAttribute('data-id')
    })
    return
  }

  if (_target = event.target.closest('.bt_exportcsv')) {
    var fullFile = ''
    var eqParent, cmd
    document.querySelectorAll('.eqLogic').forEach(_eqlogic => {
      eqParent = _eqlogic.closest('.panel.panel-default')
      eqParent = eqParent.querySelector('a.accordion-toggle').textContent
      fullFile += eqParent + ',' + _eqlogic.getAttribute('data-id') + ',' + _eqlogic.getAttribute('data-name') + ',' + _eqlogic.getAttribute('data-type') + "\n"
      _eqlogic.querySelectorAll('.cmd').forEach(_cmd => {
        fullFile += "\t\t" + _cmd.getAttribute('data-id') + ',' + _cmd.getAttribute('data-name') + "\n"
      })
    })
    _target.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(fullFile)
    return
  }

  if (_target = event.target.closest('.eqLogicSortable > li.eqLogic')) {
    if (_target.tagName.toUpperCase() == 'I') return
    if (_target.tagName.toUpperCase() == 'INPUT') return
    if (_target.hasClass('cmd')) return
    var el = _target.querySelector('ul.cmdSortable')
    if (el.isVisible()) {
      el.unseen()
    } else {
      el.seen()
    }
    return
  }
})

document.getElementById('div_pageContainer').addEventListener('change', function(event) {
  var _target = null
  if (_target = event.target.closest('#cb_actifDisplay')) {
    if (_target.checked) {
      document.querySelectorAll('.eqLogic[data-enable="0"]').seen()
    } else {
      document.querySelectorAll('.eqLogic[data-enable="0"]').unseen()
    }
    return
  }

  if (_target = event.target.closest('.cb_selEqLogic')) {
    jeeP.setEqActions()
    return
  }

  if (_target = event.target.closest('.cb_selCmd')) {
    var found = false
    for (var _cb of document.querySelectorAll('.cb_selCmd')) {
      if (_cb.checked) {
        found = true
        break
      }
    }
    if (found) {
      jeeP.actionMode = 'cmd'
      document.querySelectorAll('.eqActions').seen()
      document.querySelectorAll('.cb_selEqLogic').unseen()
      document.querySelectorAll('.bt_setIsVisible').seen()
    } else {
      jeeP.actionMode = null
      document.querySelectorAll('.cb_selEqLogic').seen()
      document.querySelectorAll('.eqActions').unseen()
      document.querySelectorAll('.bt_setIsVisible').unseen()
    }
    return
  }
})
