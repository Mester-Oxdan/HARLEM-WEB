<?php
$file = $_GET['file'];

if (file_exists($file)) {
    file_put_contents($file, '');
}
?>