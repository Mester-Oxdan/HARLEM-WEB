<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $file = $_FILES['file'];
  $atom1Type = $_POST['atom1'];
  $atom2Type = $_POST['atom2'];

  // Check if there was an error during the file upload
  if ($file['error'] === UPLOAD_ERR_OK) {
    $fileTmpPath = $file['tmp_name'];
    $fileName = $file['name'];
    $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

    // Check if the file extension is .pdb
    if ($fileExtension === 'pdb') {
      $targetDirectory = 'all_pdb_files/';
      $targetPath = $targetDirectory . $fileName;

      // Move the uploaded file to the desired location
      if (move_uploaded_file($fileTmpPath, $targetPath)) {
        // Save the information to a text file
        $filePath = 'select_type_atom.txt';
        $data = "File: $fileName" . PHP_EOL . "Atom 1 Type: $atom1Type" . PHP_EOL . "Atom 2 Type: $atom2Type" . PHP_EOL;

        // Append the new information to the text file
        file_put_contents($filePath, $data, FILE_APPEND | LOCK_EX);

        //echo 'Information saved to the text file.' . PHP_EOL;

        // Run the command and capture the output


        $command = '"C:\harlem\python.exe" "C:\MYPROG\HARLEM-WEB\calc_ET.py" ' . $targetPath . ' ' . $atom1Type . ' ' . $atom2Type;
        exec($command, $output, $status);

        if ($status === 0) {
          // Command executed successfully
          //echo 'Command executed successfully.' . PHP_EOL;

          // Save the command output to a text file
          $outputFilePath = 'command_output.txt';
          $outputData = implode("\n", $output) . PHP_EOL;
          file_put_contents($outputFilePath, $outputData, FILE_APPEND | LOCK_EX);
          //echo $outputData;
          include("2_part_of_html.html");
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
?>
