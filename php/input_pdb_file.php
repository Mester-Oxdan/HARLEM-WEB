<?php
try{
  if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    //echo "input_pdb_file pt 1";
    $file = $_FILES['file'];
    $atom1Type = $_POST['atom1'];
    $atom2Type = $_POST['atom2'];
    $name = $_POST['name'];
    //echo "input_pdb_file pt 2";

    // Check if there was an error during the file upload
    if ($file['error'] === UPLOAD_ERR_OK) {
      //echo "input_pdb_file pt 3";
      $fileTmpPath = $file['tmp_name'];
      $fileName = $file['name'];
      $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

      // Check if the file extension is .pdb
      if ($fileExtension === 'pdb') {
        //echo "input_pdb_file pt 4";
        $targetDirectory = 'all_pdb_files/';
        $targetPath = $targetDirectory . $fileName;

        // Move the uploaded file to the desired location
        if (move_uploaded_file($fileTmpPath, $targetPath)) {
          // Save the information to a text file
          $filePath = 'select_type_atom.txt';
          $data = "File: $fileName" . PHP_EOL . "Donor: $atom1Type" . PHP_EOL . "Acceptor: $atom2Type" . PHP_EOL;

          // Append the new information to the text file
          file_put_contents($filePath, $data, FILE_APPEND | LOCK_EX);

          $filePath = 'name_of_project.txt';
          $data = $name;

          // Append the new information to the text file
          file_put_contents($filePath, $data, FILE_APPEND | LOCK_EX);

          //echo 'Information saved to the text file.' . PHP_EOL;

          // Run the command and capture the output HAHA PRIVET

          $command = '"C:\harlem\python.exe" "C:\MYPROG\HARLEM-WEB\calc_ET.py" ' . $targetPath . ' ' . $atom1Type . ' ' . $atom2Type;
          //echo $command;
          exec($command, $output, $status);

          if ($status === 0) {
            // Command executed successfully
            //echo 'Command executed successfully.' . PHP_EOL;

            // Save the command output to a text file
            $outputFilePath = 'command_output.txt';
            $outputData = implode("\n", $output) . PHP_EOL;
            file_put_contents($outputFilePath, $outputData, FILE_APPEND | LOCK_EX);
            //echo $outputData;
            include("main_start.html");
            //echo '<script>window.open("2_part_of_html.html", "_blank");</script>';
          }

        } else {
          echo 'Error saving the file.' . PHP_EOL;
        }
      } else {
        echo 'Invalid file format. Only PDB files are allowed.' . PHP_EOL;
      }
    } else {
      echo 'Error uploading the file.' . PHP_EOL;
    }
  }
}
catch (Exception $e)
{
  echo "Invalid information." . PHP_EOL;
}
?>
