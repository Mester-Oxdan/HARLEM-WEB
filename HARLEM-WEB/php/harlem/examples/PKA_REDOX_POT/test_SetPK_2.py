# Calculation of pK shifts for myoglobin and cytb5 in cytb5-myo complex
# 
pmset = GetCurMolSet()
pmset.SetStdResPK()
#pmset.SetChargesForPH(7.0)
electr_mod = pmset.GetElectrostMod(1)
#for res_ref in("$CYTB5_1$HIS15","$CYTB5_1$HIS26","$CYTB5_1$HIS39","$CYTB5_1$HIS63",\
#                     "$CYTB5_1$HIS80","$CYTB5_1$HEM201"):
#   rptr = pmset.GetResByRef(res_ref)
#   electr_mod.CalcResPK(rptr)
rptr = pmset.GetResByRef("$CYTB5_1$HEM201")
electr_mod.CalcResPK(rptr)
ritr = ResidueIteratorMolSet(pmset)
rptr = ritr.GetFirstRes()
while (rptr != None):
   if(rptr.GetName() == "HIS" or rptr.GetName() == "HEM" ):
      print(rptr.PrintPK())
   rptr = ritr.GetNextRes()
