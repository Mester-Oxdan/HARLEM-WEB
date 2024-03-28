#
#	This script is used to save picture files (PICT format) of the MD trajectory
#  based on the active Harlem view. This is useful when constructing a video file
#  to showcase the MD trajectory.
#
#	You must first set up the Harlem view to the view that you want to save, and
#  display your molecules in the desired forms, such as ribbons or ball-stick models.
#
#	The script then saves .pic files labelled with the prefix "snap" in the same
#  directory as your molecule files. 
#
#	You can use a third party application available on the internet to combine the
#  .pic files into a video file, such as .mov.
#

if(script_status == SCRIPT_START): 
# Code to initialize the script on the trajectory
  
  pmset = GetCurMolSet()
  pview = pmset.GetActiveMolView()
  i = 0 # Sets a label "i" beginning at 0.
  

elif(script_status == SCRIPT_STOP):
#  Code to end the script after MD trajectory is finished.
  
  print("\nTrajectory Playback Completed\n")
  print("PICT snapshots saved to file directory")


else: 
#  Actual code that saves the PICT files.

    i = i+10 # Increments label by a value for each file name.
    
    if(i % 10 == 0):
	  #	The value used with the modulus for "i" determines how often to take a 
	  #  snapshot. Here it is set to take a snapshot every 10 MD steps.
	  #  Change this value as desired.
	  	  
	  fname = "snap" + str(10000+i) + ".pic" #  Sets the actual file name
	  print("Snapshot saved to ", fname)
	  pview.WritePICTFile(fname) #  Writes the PICT file
