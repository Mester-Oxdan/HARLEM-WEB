phi = doublep()
psi = doublep()
cost = doublep()
phi.assign(1.0)
psi.assign(1.2)
cost.assign(0.99)
rmat = HaMat_double()
rmat.newsize(3,3)
tv = HaMat_double()
vm = HaMat_double()
tv.newsize(3,1)
tv.SetVal(1,1,1.0)
tv.SetVal(2,1,1.1)
tv.SetVal(3,1,1.2)
for i in range(100):
  Rot3D_IncrEulerAng( phi, cost, psi, 0,0.00011,0)
  Rot3D_EulerToRotMat(phi.value(), cost.value(), psi.value(), rmat )
  matmult(vm,rmat,tv)
  print("%9.5f %8.4f %8.4f %8.4f " % (cost.value(),vm.GetVal(1,1), vm.GetVal(2,1), vm.GetVal(3,1)))
