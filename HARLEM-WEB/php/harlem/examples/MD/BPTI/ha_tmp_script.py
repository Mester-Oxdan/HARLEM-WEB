mset = GetCurMolSet()
mset.SelectAtomsExpr("not HOH")
pApp = GetHarlemApp()
pApp.RasMolCmd("select protein")
