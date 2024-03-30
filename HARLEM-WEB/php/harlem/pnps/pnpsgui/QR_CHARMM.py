from harlempy import molset
from harlempy.molset import *

#Load QRDB
def LoadQRDB_CHARMM():
	print("Loading QRDB-CHARMM...")
	QRDB=GetQRDB()
	ref=""
	notes="harges from CHARMM only dppc;Radii generic"
	ff=QRDB.NewFF("CHARMM",ref,notes)
	
	
	r=ff.NewRes("PAL","")
	r.SetAtom("C1"   , 0.63, 2.0)
	r.SetAtom("O1"   , -0.52, 1.7)
	r.SetAtom("C2"   , -0.08, 2.0)
	r.SetAtom("H2A"   , 0.09, 1.32)
	r.SetAtom("H2B"   , 0.09, 1.32)
	r.SetAtom("C3"   , -0.18, 2.0)
	r.SetAtom("H3A"   , 0.09, 1.32)
	r.SetAtom("H3B"   , 0.09, 1.32)
	r.SetAtom("C4"   , -0.18, 2.0)
	r.SetAtom("H4A"   , 0.09, 1.32)
	r.SetAtom("H4B"   , 0.09, 1.32)
	r.SetAtom("C5"   , -0.18, 2.0)
	r.SetAtom("H5A"   , 0.09, 1.32)
	r.SetAtom("H5B"   , 0.09, 1.32)
	r.SetAtom("C6"   , -0.18, 2.0)
	r.SetAtom("H6A"   , 0.09, 1.32)
	r.SetAtom("H6B"   , 0.09, 1.32)
	r.SetAtom("C7"   , -0.18, 2.0)
	r.SetAtom("H7A"   , 0.09, 1.32)
	r.SetAtom("H7B"   , 0.09, 1.32)
	r.SetAtom("C8"   , -0.18, 2.0)
	r.SetAtom("H8A"   , 0.09, 1.32)
	r.SetAtom("H8B"   , 0.09, 1.32)
	r.SetAtom("C9"   , -0.18, 2.0)
	r.SetAtom("H9A"   , 0.09, 1.32)
	r.SetAtom("H9B"   , 0.09, 1.32)
	r.SetAtom("C10"   , -0.18, 2.0)
	r.SetAtom("H10A"   , 0.09, 1.32)
	r.SetAtom("H10B"   , 0.09, 1.32)
	r.SetAtom("C11"   , -0.18, 2.0)
	r.SetAtom("H11A"   , 0.09, 1.32)
	r.SetAtom("H11B"   , 0.09, 1.32)
	r.SetAtom("C12"   , -0.18, 2.0)
	r.SetAtom("H12A"   , 0.09, 1.32)
	r.SetAtom("H12B"   , 0.09, 1.32)
	r.SetAtom("C13"   , -0.18, 2.0)
	r.SetAtom("H13A"   , 0.09, 1.32)
	r.SetAtom("H13B"   , 0.09, 1.32)
	r.SetAtom("C14"   , -0.18, 2.0)
	r.SetAtom("H14A"   , 0.09, 1.32)
	r.SetAtom("H14B"   , 0.09, 1.32)
	r.SetAtom("C15"   , -0.18, 2.0)
	r.SetAtom("H15A"   , 0.09, 1.32)
	r.SetAtom("H15B"   , 0.09, 1.32)
	r.SetAtom("C16"   , -0.27, 2.0)
	r.SetAtom("H16A"   , 0.09, 1.32)
	r.SetAtom("H16B"   , 0.09, 1.32)
	r.SetAtom("H16C"   , 0.09, 1.32)
	r=ff.NewRes("PCG","")
	r.SetAtom("C2"   , 0.04, 2.0)
	r.SetAtom("H2A"   , 0.09, 1.32)
	r.SetAtom("O2"   , -0.34, 1.7)
	r.SetAtom("C1"   , -0.05, 2.0)
	r.SetAtom("H1A"   , 0.09, 1.32)
	r.SetAtom("H1B"   , 0.09, 1.32)
	r.SetAtom("O1"   , -0.34, 1.7)
	r.SetAtom("N"   , -0.6, 1.85)
	r.SetAtom("C5"   , -0.1, 2.0)
	r.SetAtom("C6"   , -0.35, 2.0)
	r.SetAtom("C7"   , -0.35, 2.0)
	r.SetAtom("C8"   , -0.35, 2.0)
	r.SetAtom("H5A"   , 0.25, 1.32)
	r.SetAtom("H5B"   , 0.25, 1.32)
	r.SetAtom("H6A"   , 0.25, 1.32)
	r.SetAtom("H6B"   , 0.25, 1.32)
	r.SetAtom("H6C"   , 0.25, 1.32)
	r.SetAtom("H7A"   , 0.25, 1.32)
	r.SetAtom("H7B"   , 0.25, 1.32)
	r.SetAtom("H7C"   , 0.25, 1.32)
	r.SetAtom("H8A"   , 0.25, 1.32)
	r.SetAtom("H8B"   , 0.25, 1.32)
	r.SetAtom("H8C"   , 0.25, 1.32)
	r.SetAtom("C4"   , -0.08, 2.0)
	r.SetAtom("H4A"   , 0.09, 1.32)
	r.SetAtom("H4B"   , 0.09, 1.32)
	r.SetAtom("P"   , 1.5, 1.4)
	r.SetAtom("OP3"   , -0.78, 1.7)
	r.SetAtom("OP4"   , -0.78, 1.7)
	r.SetAtom("OP1"   , -0.57, 1.7)
	r.SetAtom("OP2"   , -0.57, 1.7)
	r.SetAtom("C3"   , -0.08, 2.0)
	r.SetAtom("H3A"   , 0.09, 1.32)
	r.SetAtom("H3B"   , 0.09, 1.32)

	#Lipids
	#DPhPC, charges from GROMACS, radii from PARSE
	#r=ff.NewRes("DPH", "")
	#r.SetAtom("C33", 0.4,2.0)
	#r.SetAtom("C34", 0.4,2.0)
	#r.SetAtom("C35", 0.4,2.0)
	#r.SetAtom("N", -0.5,1.5)
	#r.SetAtom("C32", 0.3,2.0)
	#r.SetAtom("C31", 0.4,2.0)
	#r.SetAtom("O32", -0.8,1.4)
	#r.SetAtom("P", 1.7,1.8)
	#r.SetAtom("O33", -0.8,1.4)
	#r.SetAtom("O34", -0.8,1.4)
	#r.SetAtom("O31", -0.7,1.4)
	#r.SetAtom("C3", 0.4,2.0)
	#r.SetAtom("C2", 0.3,2.0)
	#r.SetAtom("O21", -0.7,1.4)
	#r.SetAtom("C21", 0.7,2.0)
	#r.SetAtom("O22", -0.7,1.4)
	#r.SetAtom("C22", 0,2.0)
	#r.SetAtom("C23", 0,2.0)
	#r.SetAtom("C24", 0,2.0)
	#r.SetAtom("C25", 0,2.0)
	#r.SetAtom("C26", 0,2.0)
	#r.SetAtom("C27", 0,2.0)
	#r.SetAtom("C28", 0,2.0)
	#r.SetAtom("C29", 0,2.0)
	#r.SetAtom("C210", 0,2.0)
	#r.SetAtom("C211", 0,2.0)
	#r.SetAtom("C212", 0,2.0)
	#r.SetAtom("C213", 0,2.0)
	#r.SetAtom("C214", 0,2.0)
	#r.SetAtom("C215", 0,2.0)
	#r.SetAtom("C216", 0,2.0)
	#r.SetAtom("C1", 0.5,2.0)
	#r.SetAtom("O11", -0.7,1.4)
	#r.SetAtom("C11", 0.8,2.0)
	#r.SetAtom("O12", -0.6,1.4)
	#r.SetAtom("C12", 0,2.0)
	#r.SetAtom("C13", 0,2.0)
	#r.SetAtom("C14", 0,2.0)
	#r.SetAtom("C15", 0,2.0)
	#r.SetAtom("C16", 0,2.0)
	#r.SetAtom("C17", 0,2.0)
	#r.SetAtom("C18", 0,2.0)
	#r.SetAtom("C19", 0,2.0)
	#r.SetAtom("C110", 0,2.0)
	#r.SetAtom("C111", 0,2.0)
	#r.SetAtom("C112", 0,2.0)
	#r.SetAtom("C113", 0,2.0)
	#r.SetAtom("C114", 0,2.0)
	#r.SetAtom("C115", 0,2.0)
	#r.SetAtom("C116", 0,2.0)
	#r.SetAtom("C63", 0,2.0)
	#r.SetAtom("C67", 0,2.0)
	#r.SetAtom("C611", 0,2.0)
	#r.SetAtom("C615", 0,2.0)
	#r.SetAtom("C73", 0,2.0)
	#r.SetAtom("C77", 0,2.0)
	#r.SetAtom("C711", 0,2.0)
	#r.SetAtom("C715", 0,2.0)
	print()
LoadQRDB_CHARMM()
