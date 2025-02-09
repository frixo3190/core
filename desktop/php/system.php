<?php
if (!isConnect('admin')) {
  throw new Exception('{{401 - Accès non autorisé}}');
}

$sysCmds = array (
  array("cmd"=>'ps -eo size,pid,user,command --sort -size"', "name"=>'Memory Usage'),
  array("cmd"=>'ps -eo pid,ppid,%mem,%cpu,cmd --sort=-%cpu"', "name"=>'CPU Usage'),
  array("cmd"=>'sudo dmesg"', "name"=>'dmesg'),
  array("cmd"=>'sudo ip addr"', "name"=>'ip addr'),
  array("cmd"=>'sudo lsusb"', "name"=>'lsusb'),
  array("cmd"=>'sudo ls -la /dev/ttyUSB*"', "name"=>'ls -la /dev/ttyUSB*'),
  array("cmd"=>'free -m"', "name"=>'free -m'),
  array("cmd"=>'sudo ps ax"', "name"=>'ps ax'),
  array("cmd"=>'df -h"', "name"=>'df -h'),
  array("cmd"=>'w"', "name"=>'w'),
  array("cmd"=>'dpkg -l"', "name"=>'dpkg -l'),
  array("cmd"=>'netstat -tupln"', "name"=>'netstat -tupln'),
);
$sysCmdsSudo = array (
  array("cmd"=>'sudo rm -f /var/lib/dpkg/updates/*', "name"=>'Fix dpkg'),
  array("cmd"=>'echo "yes | sudo apt -f install" | sudo at now', "name"=>'Fix install'),
  array("cmd"=>'echo "sudo dpkg --configure -a --force-confdef" | sudo at now', "name"=>'Dpkg configure'),
  array("cmd"=>'sudo ../../health.sh', "name"=>'health.sh'),
  array("cmd"=>'sudo echo "nameserver 8.8.8.8" > /etc/resolv.conf', "name"=>'Set DNS'),
  array("cmd"=>'sudo cat /var/log/mysql/error.log', "name"=>'MySQL log'),
  array("cmd"=>'sudo fdtput -t s /media/boot/multiboot/meson64_odroidc2.dtb.linux /i2c@c1108500/pcf8563@51 status "okay"', "name"=>'RTC Jeedom Pro'),
  array("cmd"=>'sudo cp /var/www/html/install/apache_security_unsecure /etc/apache2/conf-available/security.conf;sudo a2enmod headers;echo "systemctl restart apache2" | sudo at now', "name"=>' {{Apache non securisé}}'),
  array("cmd"=>'sudo cp /var/www/html/install/apache_security /etc/apache2/conf-available/security.conf;sudo a2enmod headers;echo "systemctl restart apache2" | sudo at now', "name"=>' {{Apache sécurisé}}'),
);
?>

<div id="div_rowSystemCommand" class="row row-overflow">
  <div class="col-lg-2 col-md-3 col-sm-4" style="overflow: hidden auto;">
    <div class="bs-sidebar">
      <ul id="ul_userListCmdHistory" class="nav nav-list bs-sidenav list-group"></ul>
      <ul id="ul_systemListCmd" class="nav nav-list bs-sidenav list-group">
        <li class="filter">
          <input class="filter form-control input-sm" placeholder="{{Rechercher}}"/>
        </li>
        <?php
          $list = '';
          foreach ($sysCmds as $cmd) {
            $list .= '<li class="cursor list-group-item list-group-item-success">';
            $list .= '<a class="bt_systemCommand" data-command="'.$cmd["cmd"].'">'.$cmd["name"].'</a></li>';
          }
          echo $list;

          if (jeedom::isCapable('sudo')) {
            $list = '<li class="info list-group-item">• Cmd Sudo:</li>';
            foreach ($sysCmdsSudo as $cmd) {
              $list .= '<li class="cursor list-group-item list-group-item-success">';
              $list .= '<a class="bt_systemCommand" data-command="'.$cmd["cmd"].'">'.$cmd["name"].'</a></li>';
            }
            echo $list;
          }
        ?>
      </ul>
    </div>
  </div>
  <div class="col-lg-10 col-md-9 col-sm-8">
    <div class="alert alert-info" id="h3_executeCommand">{{Cliquez sur une commande à gauche ou tapez une commande personnalisée ci-dessous}}</div>
    <div class="input-group">
      <input id="in_specificCommand" class="form-control roundedLeft" />
      <div class="input-group-btn">
        <a id="bt_validateSpecifiCommand" class="btn btn-warning roundedRight"><i class="fas fa-check"></i> {{OK}}</a>
      </div>
    </div>
    <pre id="pre_commandResult"></pre>
  </div>
</div>

<?php include_file("desktop", "system", "js"); ?>