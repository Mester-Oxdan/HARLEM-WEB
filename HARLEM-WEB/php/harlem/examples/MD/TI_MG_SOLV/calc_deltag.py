#
# This example script to run thermodynamic Integration 
#
mset = GetCurMolSet()
mset.SetName("mg_wat_1_ti")
mm_mod = mset.GetMolMechMod(1)
ti_mod = mm_mod.GetTISimMod()
ti_mod.SetNumLambda(5)
ti_mod.SetNumEqPoints(0)
delta_g = ti_mod.CalcDeltaG()
ti_mod.ReduceDvDlData(100000)
#print "Delta G = ",delta_g

