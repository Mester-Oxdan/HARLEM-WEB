mset = GetCurMolSet()
qc_mod = mset.GetQCMod(1)
zm = qc_mod.GetZMat()
b1 = zm.GetCrdByTag("roh1")
b1.SetFrozen()
b1.SetValue(1.0)
qc_mod.InitBasis("3-21G")
qc_mod.SetMP2()
qc_mod.SetEneMinCalc()
qc_mod.Run()
print("MP2 ene = ",qc_mod.GetEne())
print("HF ene = ",qc_mod.GetHFEne())

