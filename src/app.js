const path = require('path')
const express = require('express')
const nunjucks = require('nunjucks')
const bodyParser = require('body-parser')
const _ = require('lodash')
const dbConfig = require('./config')
const knex = require('knex')(dbConfig)
const app = express()

app.use(express.static(path.resolve(__dirname, './public')))
app.set('views', path.resolve(__dirname, './views'))
nunjucks.configure(path.resolve(__dirname, './views'), {
  autoescape: true,
  express: app
})
app.set('view engine', 'html')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', async (req, res) => {
  res.render('home/home.html')
})

function filterTkbNew (tkb) {
  return [
    _.filter(tkb, { tiet: 1 }),
    _.filter(tkb, { tiet: 2 }),
    _.filter(tkb, { tiet: 3 }),
    _.filter(tkb, { tiet: 4 }),
    _.filter(tkb, { tiet: 5 }),
    _.filter(tkb, { tiet: 6 }),
    _.filter(tkb, { tiet: 7 }),
    _.filter(tkb, { tiet: 8 }),
    _.filter(tkb, { tiet: 9 }),
    _.filter(tkb, { tiet: 10 })
  ]
}

function demNgayDayY (tkb, idgiangvien, thu) {
  const gioday = _.filter(tkb, { idgiangvien, thu })
  if (gioday.length) {
    return 1
  }
  return 0
}

// Không giảng viên nào dạy 2 lớp trong cùng thời gian
function giangBuocHC1 (tkb, idgiangvien, idmonhoc, thu, tiet) {
  const result = _.filter(tkb, { idgiangvien, idmonhoc, thu, tiet })
  if (result.length >= 2) {
    console.log('Loi giang buoc 1')
    return false
  }
  return true
}
//  Không lớp nào phải học 2 môn trong cùng 1 thời gian
function giangBuocHC2 (tkb, idlop, thu, tiet) {
  const result = _.filter(tkb, { idlop, thu, tiet })
  if (result.length >= 2) {
    console.log('Loi giang buoc 2')
    return false
  }
  return true
}
// Giảng viên phải dạy đúng lớp và đúng môn học được giao
function giangBuocHC3 (tkb, A, idgiangvien, idmonhoc, idlop, thu, tiet) {
  const resultTkb = _.filter(tkb, { idgiangvien, idmonhoc, idlop, thu, tiet })
  const lopPhanCong = _.filter(A, { idgiangvien, idmonhoc, idlop, duocdaylop: 0 })// dc day
  if (lopPhanCong[0].duocdaylop * resultTkb[0].duocdayloptaitiet === 0) {
    return true
  }
  return false
}
// Mỗi giảng viên dạy 1 môn nào đó phải đủ số lớp theo phân công
function giangBuocHC4 (tkb, monhoc, A, idgiangvien, idmonhoc) {
  const resultTkb = _.filter(tkb, { idgiangvien, idmonhoc })
  const filterMon = _.filter(monhoc, { id: idmonhoc })[0]
  const resultA = _.filter(A, { idgiangvien, idmonhoc, duocdaylop: 0 })
  if (resultTkb.length / filterMon.sotinchi === resultA.length) {
    return true
  }
  console.log('Loi giang buoc 4')
  return false
}
// Mỗi giảng viên phải dạy đủ số môn
function giangBuocHC5 (tkb, monhoc, A, idgiangvien, idmonhoc) {
  const resultAGvDuocDayMonHoc = _.filter(A, { idgiangvien, idmonhoc, duocdaylop: 0 })
  const resultTkbCuaGVDayMonHoc = _.filter(tkb, { idgiangvien, idmonhoc })
  const filterMonHoc = _.filter(monhoc, { id: idmonhoc })[0]
  if (resultAGvDuocDayMonHoc.length === resultTkbCuaGVDayMonHoc.length / filterMonHoc.sotinchi || filterMonHoc.length) {
    return true
  }
  console.log('Loi giang buoc 5')
  return false
}
// Các lớp học đúng thời gian được phân công
function giangBuocHC6 (tkb, A, idgiangvien, idmonhoc, idlop, thu, tiet, monhoc) {
  const resultTkbGvDayMonTaiThuTiet = _.filter(tkb, { idgiangvien, idmonhoc, idlop, thu, tiet })
  const lopPhanCongCuaDv = _.filter(A, { idgiangvien, idmonhoc, idlop, duocdaylop: 0 })
  const filterMonHoc = _.filter(monhoc, { id: idmonhoc })[0]
  if (lopPhanCongCuaDv[0].duocdaylop * resultTkbGvDayMonTaiThuTiet[0].duocdayloptaitiet === 0 || filterMonHoc.length) {
    return true
  }
  return false
}
function giangBuocMem (tkb, monhoc, A, idgiangvien, idmonhoc) {
  const resultTkbGvMon = _.filter(tkb, { idgiangvien, idmonhoc })
  const filterMonGBM = _.filter(monhoc, { id: idmonhoc })
  const resultAGBM = _.filter(A, { idgiangvien, idmonhoc, duocdaylop: 0 })
  if (resultTkbGvMon.length / filterMonGBM[0].sotinchi === resultAGBM.length) {
    return true
  }
  console.log('Loi giang buoc mem')
  return false
}
function kiemTra (arrayX, A, monhoc, listTkbOke = []) {
  for (let index = 0; index < arrayX.length; index++) {
    const tkb = arrayX[index]
    let KT = true
    for (let indexTkb = 0; indexTkb < tkb.length; indexTkb++) {
      const { idgiangvien, idmonhoc, idlop, thu, tiet } = tkb[indexTkb]
      if (
        giangBuocHC1(tkb, idgiangvien, idmonhoc, thu, tiet) === false ||
        giangBuocHC2(tkb, idlop, thu, tiet) === false ||
        giangBuocHC3(tkb, A, idgiangvien, idmonhoc, idlop, thu, tiet) === false ||
        giangBuocHC4(tkb, monhoc, A, idgiangvien, idmonhoc) === false ||
        giangBuocHC5(tkb, monhoc, A, idgiangvien, idmonhoc) === false ||
        giangBuocHC6() === false
      ) {
        KT = false
        break
      }
    }
    KT && listTkbOke.push(tkb)
  }

  return listTkbOke
}

app.get('/:type', async (req, res) => {
  const { type } = req.params
  const template = `${type}/${type}.html`
  switch (type) {
    case 'giangvien':
      const listTeacher = await knex('giangvien').select()

      res.render(template, {
        listTeacher,
        numberOfTeacher: listTeacher.length
      })
      return
    case 'monhoc':
      const [listSubject] = await Promise.all([
        await knex('monhoc').select()
      ])
      res.render(template, {
        listSubject,
        numberOfSuject: listSubject.length
      })
      break
    case 'phanconggiangday': {
      const [listTeacherGiangDay, listClassGiangDay, listSubjectGiangDay, listPhanCongGiangDay] = await Promise.all([
        await knex('giangvien').select(),
        await knex('lop').select(),
        await knex('monhoc').select(),
        await knex('phanconggiangday').select()
      ])
      for (let index = 0; index < listPhanCongGiangDay.length; index++) {
        const giangVien = _.filter(listTeacherGiangDay, { id: listPhanCongGiangDay[index].idgiangvien })
        const lopHoc = _.filter(listClassGiangDay, { id: listPhanCongGiangDay[index].idlop })
        const monHoc = _.filter(listSubjectGiangDay, { id: listPhanCongGiangDay[index].idmonhoc })
        listPhanCongGiangDay[index].chiTietGv = giangVien[0]
        listPhanCongGiangDay[index].chiTietLopHoc = lopHoc[0]
        listPhanCongGiangDay[index].chiTietMonHoc = monHoc[0]
      }
      res.render(template, {
        listTeacherGiangDay,
        listClassGiangDay,
        listSubjectGiangDay,
        listPhanCongGiangDay,
        numberOfSuject: listSubjectGiangDay.length
      })
      break
    }
    case 'phanconggiangday2':
    {
      const [listTeacherGiangDay, listClassGiangDay, listSubjectGiangDay, listPhanCongGiangDay] = await Promise.all([
        await knex('giangvien').select(),
        await knex('lop').select(),
        await knex('monhoc').select(),
        await knex('phanconggiangday2').select()
      ])
      for (let index = 0; index < listPhanCongGiangDay.length; index++) {
        const giangVien = _.filter(listTeacherGiangDay, { id: listPhanCongGiangDay[index].idgiangvien })
        const lopHoc = _.filter(listClassGiangDay, { id: listPhanCongGiangDay[index].idlop })
        const monHoc = _.filter(listSubjectGiangDay, { id: listPhanCongGiangDay[index].idmonhoc })
        listPhanCongGiangDay[index].chiTietGv = giangVien[0]
        listPhanCongGiangDay[index].chiTietLopHoc = lopHoc[0]
        listPhanCongGiangDay[index].chiTietMonHoc = monHoc[0]
      }
      res.render(template, {
        listTeacherGiangDay,
        listClassGiangDay,
        listSubjectGiangDay,
        listPhanCongGiangDay,
        numberOfSuject: listSubjectGiangDay.length
      })
      break
    }
    case 'lop':
      const listClassNeww = await knex('lop').select()
      res.render(template, {
        listClass: listClassNeww,
        numberOfClass: listClassNeww.length
      })
      break
    default:
      res.redirect('/')
      break
  }
})

app.get('/tkb/sinhtkb', async (req, res) => {
  let [listTeacherNew, listClassNew, listSubjectNew, listPhanCongGiangDayNew] = await Promise.all([
    await knex('giangvien').select(),
    await knex('lop').select(),
    await knex('monhoc').select(),
    await knex('phanconggiangday').select()
  ])

  const danhSachThuHoc = [2, 3, 4, 5, 6]
  const danhTietHocTrongNgay = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  // Tao mang A phan cong mon hoc: { idgiangvien: 2, idmonhoc: 2, idlop: 2, duocdaylop: 0 }
  const A = []
  for (let giangvien = 0; giangvien < listTeacherNew.length; giangvien++) {
    for (let monhoc = 0; monhoc < listSubjectNew.length; monhoc++) {
      for (let lop = 0; lop < listClassNew.length; lop++) {
        const filter = {
          idgiangvien: listTeacherNew[giangvien].id,
          idmonhoc: listSubjectNew[monhoc].id,
          idlop: listClassNew[lop].id
        }
        const phanCong = _.filter(listPhanCongGiangDayNew, filter)
        if (phanCong.length) {
          A.push({ ...filter, duocdaylop: 0 }) // 0 là được dạy lớp này
        } else {
          A.push({ ...filter, duocdaylop: 1 }) // 1 là không được dạy lớp này
        }
      }
    }
  }

  const L = []
  // Tao mang L thời gian có thể học của lớp: { idlop: 2, thu: 2, tiet: 1, duocdaytiet: 0 }

  for (let lop = 0; lop < listClassNew.length; lop++) {
    for (let thuhoc = 0; thuhoc < danhSachThuHoc.length; thuhoc++) {
      for (let tiethoc = 0; tiethoc < danhTietHocTrongNgay.length; tiethoc++) {
        if (listClassNew[lop].buoihoc === 's') {
          if (danhTietHocTrongNgay[tiethoc] >= 1 && danhTietHocTrongNgay[tiethoc] <= 5) {
            L.push({
              idlop: listClassNew[lop].id,
              thu: danhSachThuHoc[thuhoc],
              tiet: danhTietHocTrongNgay[tiethoc],
              buoihoc: 's',
              duocdaytiet: 0 // 0 là được dạy tiết này
            })
          } else {
            L.push({
              idlop: listClassNew[lop].id,
              thu: danhSachThuHoc[thuhoc],
              tiet: danhTietHocTrongNgay[tiethoc],
              buoihoc: 's',
              duocdaytiet: 1 // 1 là không được dạy tiết này
            })
          }
        } else {
          if (danhTietHocTrongNgay[tiethoc] >= 1 && danhTietHocTrongNgay[tiethoc] <= 5) {
            L.push({
              idlop: listClassNew[lop].id,
              thu: danhSachThuHoc[thuhoc],
              tiet: danhTietHocTrongNgay[tiethoc],
              buoihoc: 'c',
              duocdaytiet: 1 // 1 là không được dạy tiết này
            })
          } else {
            L.push({
              idlop: listClassNew[lop].id,
              thu: danhSachThuHoc[thuhoc],
              tiet: danhTietHocTrongNgay[tiethoc],
              buoihoc: 'c',
              duocdaytiet: 0 // 0 là được dạy tiết này
            })
          }
        }
      }
    }
  }

  // Tạo mảng X biểu diễn khả năng giảng viên P được dạy môn S lớp C thứ D tiết T
  // A - { idgiangvien: 2, idmonhoc: 2, idlop: 2, duocdaylop: 1 } L - { idlop: 2, thu: 2, tiet: 1, duocdaytiet: 0 }
  const X = []
  for (let index = 0; index < A.length; index++) {
    const listLop = _.filter(L, { idlop: A[index].idlop })
    for (let indexLop = 0; indexLop < listLop.length; indexLop++) {
      X.push({
        ...A[index],
        ...listLop[indexLop],
        duocdayloptaitiet: 0 // 0 Là không được dạy lớp này tại tiết này
      })
    }
  }

  // For mảng A phân công giảng dạy : 0 được dạy - 1 không được dạy ({ idgiangvien: 2, idmonhoc: 2, idlop: 2, duocdaylop: 0 })
  let dem = 0
  // listTeacherNew = _.shuffle(listTeacherNew)

  for (let indexGV = 0; indexGV < listTeacherNew.length; indexGV++) {
    const phanCongGiangDayCuaGvHienTai = _.filter(A, { idgiangvien: listTeacherNew[indexGV].id, duocdaylop: 0 })
    for (let indexLop = 0; indexLop < listClassNew.length; indexLop++) {
      const dsMonHocCuaGvTaiLopHienTai = _.filter(phanCongGiangDayCuaGvHienTai, { idlop: listClassNew[indexLop].id })

      if (dsMonHocCuaGvTaiLopHienTai.length) {
        let soTinChiCuaMon = 0
        let KT = true

        for (let indexMon = 0; indexMon < dsMonHocCuaGvTaiLopHienTai.length; indexMon++) {
          const monHoc = dsMonHocCuaGvTaiLopHienTai[indexMon]
          const thongTinMonHoc = _.filter(listSubjectNew, { id: monHoc.idmonhoc })[0]
          soTinChiCuaMon = 0

          for (let indexThu = 0; indexThu < danhSachThuHoc.length; indexThu++) {
            if (!KT) {
              KT = true
              break
            }
            const thuHoc = danhSachThuHoc[indexThu]

            const filterSoTietLopDaHocTheoBuoi = _.filter(X, {
              idlop: listClassNew[indexLop].id,
              buoihoc: listClassNew[indexLop].buoihoc,
              thu: thuHoc,
              duocdayloptaitiet: 1
            })

            const filterSoTietGvDaDayTheoBuoi = _.filter(X, {
              idgiangvien: listTeacherNew[indexGV].id,
              buoihoc: listClassNew[indexLop].buoihoc,
              thu: thuHoc,
              duocdayloptaitiet: 1
            })
            const tietCuoiCungGiangVienDay = filterSoTietGvDaDayTheoBuoi.length ? filterSoTietGvDaDayTheoBuoi[filterSoTietGvDaDayTheoBuoi.length - 1].tiet : 0
            const soTietConLaiTrongBuoiCuaGiangVien = listClassNew[indexLop].buoihoc === 's' ? 5 - tietCuoiCungGiangVienDay : 10 - tietCuoiCungGiangVienDay
            if ((5 - filterSoTietLopDaHocTheoBuoi.length) >= thongTinMonHoc.sotinchi &&
            (5 - filterSoTietGvDaDayTheoBuoi.length) >= thongTinMonHoc.sotinchi &&
            soTietConLaiTrongBuoiCuaGiangVien >= thongTinMonHoc.sotinchi &&
            (5 - (filterSoTietLopDaHocTheoBuoi.length ? filterSoTietLopDaHocTheoBuoi[filterSoTietLopDaHocTheoBuoi.length - 1].tiet : 0)) >= thongTinMonHoc.sotinchi) {
              for (let indexTiet = 0; indexTiet < danhTietHocTrongNgay.length; indexTiet++) {
                if (soTinChiCuaMon >= thongTinMonHoc.sotinchi) {
                  KT = false
                  break
                }
                const tietHoc = danhTietHocTrongNgay[indexTiet]

                // HC1
                const kiemTraXemGvDoTaiThuDoTietDoDaDayLopNaoChua = _.filter(X, {
                  idgiangvien: listTeacherNew[indexGV].id,
                  thu: thuHoc,
                  tiet: tietHoc,
                  duocdayloptaitiet: 1
                })
                if (!kiemTraXemGvDoTaiThuDoTietDoDaDayLopNaoChua.length) {
                // HC2
                  const kiemTraXemLopDoTaiThuDoTietDoDaHocMonNaoChua = _.filter(X, {
                    idlop: listClassNew[indexLop].id,
                    thu: thuHoc,
                    tiet: tietHoc,
                    duocdayloptaitiet: 1
                  })

                  if (!kiemTraXemLopDoTaiThuDoTietDoDaHocMonNaoChua.length) {
                    const kiemTraThuVaTietCoDuocHocKhong = _.filter(L, {
                      idlop: listClassNew[indexLop].id,
                      thu: thuHoc,
                      tiet: tietHoc,
                      duocdaytiet: 0
                    })
                    if (kiemTraThuVaTietCoDuocHocKhong.length) {
                      const filterX = {
                        idgiangvien: listTeacherNew[indexGV].id,
                        idmonhoc: monHoc.idmonhoc,
                        idlop: listClassNew[indexLop].id,
                        thu: thuHoc,
                        tiet: tietHoc,
                        duocdayloptaitiet: 0
                      }

                      const Xpsctd = _.filter(X, filterX)

                      if (Xpsctd.length) {
                        const indexOfXpsctd = X.indexOf(Xpsctd[0])
                        X[indexOfXpsctd] = {
                          ...Xpsctd[0], duocdayloptaitiet: 1
                        }
                        dem += 1
                        soTinChiCuaMon += 1
                        console.log('Da them vao X ', dem)
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  const XCuoiCung = _.filter(X, { duocdayloptaitiet: 1 })
  const listDone = await knex('xrandom').insert({ value: JSON.stringify(XCuoiCung) })
  console.log('================================================')
  console.log('Tkb Da themmmmmmmmm: =======: ', listDone)
  console.log('================================================')
  return res.redirect('/tkb/sinhtkb')
})

app.get('/tkb/giangvien', async (req, res) => {
  try {
    const { giangvien = 1, idtkb = 1 } = req.query
    const [listTeacherNew, listClassNew, listSubjectNew] = await Promise.all([
      await knex('giangvien').select(),
      await knex('lop').select(),
      await knex('monhoc').select()
    ])

    const tkb = await knex('xlaitao').select().where('id', idtkb).first()
    const tkbCuoi = JSON.parse(tkb.value)
    let danhsachDuocSapXep = _.sortBy(tkbCuoi, ['thu', 'tiet'])
    let tkbThemThongTin = []
    for (let thongtin = 0; thongtin < danhsachDuocSapXep.length; thongtin++) {
      const thongtinhientai = danhsachDuocSapXep[thongtin]
      const thongtinGiangVien = _.filter(listTeacherNew, { id: thongtinhientai.idgiangvien })[0]
      const thongtinLop = _.filter(listClassNew, { id: thongtinhientai.idlop })[0]
      const thongtinMonHoc = _.filter(listSubjectNew, { id: thongtinhientai.idmonhoc })[0]
      tkbThemThongTin.push({
        ...thongtinhientai,
        thongtinGiangVien,
        thongtinLop,
        thongtinMonHoc
      })
    }

    let thongTinGiangVien
    if (giangvien) {
      tkbThemThongTin = _.filter(tkbThemThongTin, { idgiangvien: parseInt(giangvien) })
      thongTinGiangVien = _.filter(listTeacherNew, { id: parseInt(giangvien) })[0]

      const tkbThu2 = _.filter(tkbThemThongTin, { thu: 2 })
      const tkbThu3 = _.filter(tkbThemThongTin, { thu: 3 })
      const tkbThu4 = _.filter(tkbThemThongTin, { thu: 4 })
      const tkbThu5 = _.filter(tkbThemThongTin, { thu: 5 })
      const tkbThu6 = _.filter(tkbThemThongTin, { thu: 6 })

      const danhSachTkb = {
        thuHai: filterTkbNew(tkbThu2),
        thuBa: filterTkbNew(tkbThu3),
        thuTu: filterTkbNew(tkbThu4),
        thuNam: filterTkbNew(tkbThu5),
        thuSau: filterTkbNew(tkbThu6)
      }
      return res.render('tkb/tkb.html', {
        danhSachTkb,
        listTeacherNew,
        giangvien: thongTinGiangVien,
        idtkb
      })
    }
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
      data: error
    })
  }
})

app.get('/tkb/giangbuoc', async (req, res) => {
  try {
    const [listTeacherNew, listClassNew, listSubjectNew, listPhanCongMonHoc, listRandomX] = await Promise.all([
      await knex('giangvien').select(),
      await knex('lop').select(),
      await knex('monhoc').select(),
      await knex('phanconggiangday').select(),
      await knex('xrandom').select()
    ])
    let listDung = []
    for (let indexX = 0; indexX < listRandomX.length; indexX++) {
      const jsonX = JSON.parse(listRandomX[indexX].value)
      const jsonXAfterSort = _.sortBy(jsonX, ['thu', 'tiet'])
      let KT_NGOAI = true

      for (let indexGv = 0; indexGv < listTeacherNew.length; indexGv++) {
        let KT = true
        const giangvienHienTai = listTeacherNew[indexGv]
        const listTietHocGv = _.filter(jsonXAfterSort, { idgiangvien: giangvienHienTai.id })

        if (!KT) {
          break
        }
      }

      if (KT_NGOAI) {
        listDung.push({ id: indexX })
      }
    }

    for (let indexListDung = 0; indexListDung < listDung.length; indexListDung++) {
      const valueJson = JSON.parse(listRandomX[listDung[indexListDung].id].value)
      let tongNgayLenTruongGv = 0
      for (let indexgv = 0; indexgv < listTeacherNew.length; indexgv++) {
        const gvhientai = listTeacherNew[indexgv]
        tongNgayLenTruongGv += demNgayDayY(valueJson, gvhientai.id, 2)
        tongNgayLenTruongGv += demNgayDayY(valueJson, gvhientai.id, 3)
        tongNgayLenTruongGv += demNgayDayY(valueJson, gvhientai.id, 4)
        tongNgayLenTruongGv += demNgayDayY(valueJson, gvhientai.id, 5)
        tongNgayLenTruongGv += demNgayDayY(valueJson, gvhientai.id, 6)
      }
      listDung[indexListDung].tongngay = tongNgayLenTruongGv
    }
    const listDungSort = _.sortBy(listDung, 'tongngay')

    // Truncate x table
    await knex('xlaitao').truncate()
    let listPromise = []
    for (let indexListDung = 0; indexListDung < listDungSort.length; indexListDung++) {
      const Xdung = listDungSort[indexListDung]
      listPromise.push(knex('xlaitao').insert({ value: listRandomX[Xdung.id].value, tongngay: Xdung.tongngay }))
    }

    const listThemVaoX = await Promise.all(listPromise)

    return res.json({ listThemVaoX })
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
      data: error
    })
  }
})

app.get('/tkb/giangbuoc/laitao', async (req, res) => {
  try {
    const [listTeacherNew, listClassNew, listSubjectNew, listPhanCongMonHoc, listLaiTao] = await Promise.all([
      await knex('giangvien').select(),
      await knex('lop').select(),
      await knex('monhoc').select(),
      await knex('phanconggiangday').select(),
      await knex('xlaitao').select()
    ])
    let listDung = []
    for (let indexX = 0; indexX < listLaiTao.length; indexX++) {
      const jsonX = JSON.parse(listLaiTao[indexX].value)
      const jsonXAfterSort = _.sortBy(jsonX, ['thu', 'tiet'])
      let KT_NGOAI = true

      for (let indexGv = 0; indexGv < listTeacherNew.length; indexGv++) {
        let KT = true
        const giangvienHienTai = listTeacherNew[indexGv]
        const listTietHocGv = _.filter(jsonXAfterSort, { idgiangvien: giangvienHienTai.id })

        // const listTietThu2 = _.filter(listTietHocGv, { thu: 2 })
        // if (listTietThu2.length) {
        //   for (let indexTietThu2 = 0; indexTietThu2 < listTietThu2.length - 1; indexTietThu2++) {
        //     const tietDau = listTietThu2[indexTietThu2].tiet
        //     const tietSau = listTietThu2[indexTietThu2 + 1].tiet
        //     if (tietSau - tietDau !== 1) {
        //       KT = false
        //       KT_NGOAI = false
        //       break
        //     }
        //   }
        // }
        // const listTietThu3 = _.filter(listTietHocGv, { thu: 3 })
        // if (listTietThu3.length) {
        //   for (let indexTietThu3 = 0; indexTietThu3 < listTietThu3.length - 1; indexTietThu3++) {
        //     const tietDau = listTietThu3[indexTietThu3].tiet
        //     const tietSau = listTietThu3[indexTietThu3 + 1].tiet
        //     if (tietSau - tietDau !== 1) {
        //       KT = false
        //       KT_NGOAI = false
        //       break
        //     }
        //   }
        // }
        // const listTietThu4 = _.filter(listTietHocGv, { thu: 4 })
        // if (listTietThu4.length) {
        //   for (let indexTietThu4 = 0; indexTietThu4 < listTietThu4.length - 1; indexTietThu4++) {
        //     const tietDau = listTietThu4[indexTietThu4].tiet
        //     const tietSau = listTietThu4[indexTietThu4 + 1].tiet
        //     if (tietSau - tietDau !== 1) {
        //       KT = false
        //       KT_NGOAI = false
        //       break
        //     }
        //   }
        // }
        // const listTietThu5 = _.filter(listTietHocGv, { thu: 5 })
        // if (listTietThu5.length) {
        //   for (let indexTietThu5 = 0; indexTietThu5 < listTietThu5.length - 1; indexTietThu5++) {
        //     const tietDau = listTietThu5[indexTietThu5].tiet
        //     const tietSau = listTietThu5[indexTietThu5 + 1].tiet
        //     if (tietSau - tietDau !== 1) {
        //       KT = false
        //       KT_NGOAI = false
        //       break
        //     }
        //   }
        // }
        // const listTietThu6 = _.filter(listTietHocGv, { thu: 6 })
        // if (listTietThu6.length) {
        //   for (let indexTietThu6 = 0; indexTietThu6 < listTietThu6.length - 1; indexTietThu6++) {
        //     const tietDau = listTietThu6[indexTietThu6].tiet
        //     const tietSau = listTietThu6[indexTietThu6 + 1].tiet
        //     if (tietSau - tietDau !== 1) {
        //       KT = false
        //       KT_NGOAI = false
        //       break
        //     }
        //   }
        // }
        if (!KT) {
          break
        }
      }

      if (KT_NGOAI) {
        listDung.push({ id: indexX })
      }
    }

    for (let indexListDung = 0; indexListDung < listDung.length; indexListDung++) {
      const valueJson = JSON.parse(listLaiTao[listDung[indexListDung].id].value)
      let tongNgayLenTruongGv = 0
      for (let indexgv = 0; indexgv < listTeacherNew.length; indexgv++) {
        const gvhientai = listTeacherNew[indexgv]
        tongNgayLenTruongGv += demNgayDayY(valueJson, gvhientai.id, 2)
        tongNgayLenTruongGv += demNgayDayY(valueJson, gvhientai.id, 3)
        tongNgayLenTruongGv += demNgayDayY(valueJson, gvhientai.id, 4)
        tongNgayLenTruongGv += demNgayDayY(valueJson, gvhientai.id, 5)
        tongNgayLenTruongGv += demNgayDayY(valueJson, gvhientai.id, 6)
      }
      listDung[indexListDung].tongngay = tongNgayLenTruongGv
    }
    const listDungSort = _.sortBy(listDung, 'tongngay')

    // Truncate x table
    await knex('xlaitao').truncate()
    let listPromise = []
    for (let indexListDung = 0; indexListDung < listDungSort.length / 2; indexListDung++) {
      const Xdung = listDungSort[indexListDung]
      listPromise.push(knex('xlaitao').insert({ value: listLaiTao[Xdung.id].value, tongngay: Xdung.tongngay }))
    }

    const listThemVaoX = await Promise.all(listPromise)

    return res.json({ listThemVaoX })
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
      data: error
    })
  }
})

const kiemTraGiangBuocLaiTao = async () => {
  const [listTeacherNew, listClassNew, listSubjectNew, listPhanCongMonHoc, listLaiTao] = await Promise.all([
    await knex('giangvien').select(),
    await knex('lop').select(),
    await knex('monhoc').select(),
    await knex('phanconggiangday').select(),
    await knex('xlaitao').select()
  ])
  let listDung = []
  for (let indexX = 0; indexX < listLaiTao.length; indexX++) {
    const jsonX = JSON.parse(listLaiTao[indexX].value)
    const jsonXAfterSort = _.sortBy(jsonX, ['thu', 'tiet'])
    let KT_NGOAI = true

    for (let indexGv = 0; indexGv < listTeacherNew.length; indexGv++) {
      let KT = true
      const giangvienHienTai = listTeacherNew[indexGv]
      const listTietHocGv = _.filter(jsonXAfterSort, { idgiangvien: giangvienHienTai.id })
      if (!KT) {
        break
      }
    }

    if (KT_NGOAI) {
      listDung.push({ id: indexX })
    }
  }

  for (let indexListDung = 0; indexListDung < listDung.length; indexListDung++) {
    const valueJson = JSON.parse(listLaiTao[listDung[indexListDung].id].value)
    let tongNgayLenTruongGv = 0
    for (let indexgv = 0; indexgv < listTeacherNew.length; indexgv++) {
      const gvhientai = listTeacherNew[indexgv]
      tongNgayLenTruongGv += demNgayDayY(valueJson, gvhientai.id, 2)
      tongNgayLenTruongGv += demNgayDayY(valueJson, gvhientai.id, 3)
      tongNgayLenTruongGv += demNgayDayY(valueJson, gvhientai.id, 4)
      tongNgayLenTruongGv += demNgayDayY(valueJson, gvhientai.id, 5)
      tongNgayLenTruongGv += demNgayDayY(valueJson, gvhientai.id, 6)
    }
    listDung[indexListDung].tongngay = tongNgayLenTruongGv
  }
  const listDungSort = _.sortBy(listDung, 'tongngay')

  // Truncate x table
  await knex('xlaitao').truncate()
  let listPromise = []
  for (let indexListDung = 0; indexListDung < listDungSort.length / 2; indexListDung++) {
    const Xdung = listDungSort[indexListDung]
    listPromise.push(knex('xlaitao').insert({ value: listLaiTao[Xdung.id].value, tongngay: Xdung.tongngay }))
  }

  const listThemVaoX = await Promise.all(listPromise)
  console.log('========================================')
  console.log('listThemVaoX laitao', listThemVaoX.length)
  console.log('========================================')
  return listThemVaoX.length
}

const taoTkbDotBien = async (tkb) => {
  const [listTeacherNew, listClassNew, listSubjectNew, listPhanCongMonHoc] = await Promise.all([
    await knex('giangvien').select(),
    await knex('lop').select(),
    await knex('monhoc').select(),
    await knex('phanconggiangday').select()
  ])
  const newTkb = tkb

  // Lay random lich phan cong bat ki (P, C, S)
  const randomPSC = listPhanCongMonHoc[_.random(0, listPhanCongMonHoc.length - 1)]
  console.log('================================================')
  console.log('randomPSC', randomPSC)
  console.log('================================================')

  const lichPhanCongGiangDayHienTai = _.filter(tkb, { idmonhoc: randomPSC.idmonhoc, idgiangvien: randomPSC.idgiangvien, idlop: randomPSC.idlop })

  console.log('================================================')
  console.log('lichPhanCongGiangDayHienTai', lichPhanCongGiangDayHienTai)
  console.log('================================================')

  // Xoa lich day cu cua P, C , S
  for (let indexLichDay = 0; indexLichDay < lichPhanCongGiangDayHienTai.length; indexLichDay++) {
    const indexCuaLichHoc = _.filter(tkb, {
      idmonhoc: lichPhanCongGiangDayHienTai[indexLichDay].idmonhoc,
      idgiangvien: lichPhanCongGiangDayHienTai[indexLichDay].idgiangvien,
      idlop: lichPhanCongGiangDayHienTai[indexLichDay].idlop
    }).length
    tkb[indexCuaLichHoc] = 0
  }

  console.log('================================================')
  console.log('Xoa thanh cong')
  console.log('================================================')
  // Them lich day moi vao thoi gian bat ki
  const soTinChiCuaMon = _.filter(listSubjectNew, { id: randomPSC.idmonhoc }).length
  const buoiHocCuaLop = _.filter(listClassNew, { id: randomPSC.idlop })[0].buoihoc
  for (let indexTinChi = 0; indexTinChi < soTinChiCuaMon; indexTinChi++) {
    const randomThuHoc = _.random(2, 6)
    const randomTietHoc = buoiHocCuaLop === 's' ? _.random(1, 5) : _.random(6, 10)
    let KT = true
    while (KT === true) {
      if (tkb[0] === 0) {
        tkb[0] === 1
        KT = false
      }
      KT = false
    }
  }
  return newTkb
}

app.get('/tkb/laitao', async (req, res) => {
  try {
    do {
      const [listX] = await Promise.all([
        await knex('xlaitao').select()
      ])

      // Xoa thong tin lai tao cu
      await knex('xlaitao').truncate()
      let listSauLaiTaoPromise = []
      for (let indexX1 = 0; indexX1 < listX.length - 1; indexX1 += 2) {
        const x1 = JSON.parse(listX[indexX1].value)
        const sangX1 = _.filter(x1, (tkb) => {
          return tkb.tiet >= 1 && tkb.tiet <= 5
        })
        const chieuX1 = _.filter(x1, (tkb) => {
          return tkb.tiet >= 6 && tkb.tiet <= 10
        })

        const x2 = JSON.parse(listX[indexX1 + 1].value)
        const sangX2 = _.filter(x2, (tkb) => {
          return tkb.tiet >= 1 && tkb.tiet <= 5
        })
        const chieuX2 = _.filter(x2, (tkb) => {
          return tkb.tiet >= 6 && tkb.tiet <= 10
        })
        const xmoi3 = [...sangX1, ...chieuX2]
        const xmoi4 = [...sangX2, ...chieuX1]
        listSauLaiTaoPromise.push(knex('xlaitao').insert({ value: JSON.stringify(xmoi3) }))
        listSauLaiTaoPromise.push(knex('xlaitao').insert({ value: JSON.stringify(xmoi4) }))
      }
      const listSauLaiTaoThemThanhCong = await Promise.all(listSauLaiTaoPromise)
      console.log('========================================')
      console.log('listSauLaiTaoThemThanhCong =', listSauLaiTaoThemThanhCong.length)
      console.log('========================================')
    } while (await kiemTraGiangBuocLaiTao() !== 1)

    // Lay phan tu tkb de lai tao
    const layPhanTuDeTaoDotBien = await knex('xlaitao').select().first()

    console.log('================================================')
    console.log('layPhanTuDeTaoDotBien', layPhanTuDeTaoDotBien)
    console.log('================================================')
    await taoTkbDotBien(JSON.stringify(layPhanTuDeTaoDotBien.value))

    await kiemTraGiangBuocLaiTao()
    return res.json({ success: true })
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
      data: error
    })
  }
})

app.get('/tkb/lop', async (req, res) => {
  try {
    const { lop = 1, idtkb = 1 } = req.query
    const [listTeacherNew, listClassNew, listSubjectNew, listPhanCongGiangDay] = await Promise.all([
      await knex('giangvien').select(),
      await knex('lop').select(),
      await knex('monhoc').select(),
      await knex('phanconggiangday').select()
    ])

    const tkb = await knex('xlaitao').select().where('id', idtkb).first()
    const tkbCuoi = JSON.parse(tkb.value)
    let danhsachDuocSapXep = _.sortBy(tkbCuoi, ['thu', 'tiet'])

    let tkbThemThongTin = []
    for (let thongtin = 0; thongtin < danhsachDuocSapXep.length; thongtin++) {
      const thongtinhientai = danhsachDuocSapXep[thongtin]
      const thongtinGiangVien = _.filter(listTeacherNew, { id: thongtinhientai.idgiangvien })[0]
      const thongtinLop = _.filter(listClassNew, { id: thongtinhientai.idlop })[0]
      const thongtinMonHoc = _.filter(listSubjectNew, { id: thongtinhientai.idmonhoc })[0]
      tkbThemThongTin.push({
        ...thongtinhientai,
        thongtinGiangVien,
        thongtinLop,
        thongtinMonHoc
      })
    }

    let thongTinLop
    if (lop) {
      tkbThemThongTin = _.filter(tkbThemThongTin, { idlop: parseInt(lop) })
      console.log('========================================')
      console.log('tkbThemThongTin ', tkbThemThongTin)
      console.log('========================================')
      thongTinLop = _.filter(listClassNew, { id: parseInt(lop) })[0]
      const danhSachMonHocCuaLop = _.filter(listPhanCongGiangDay, { idlop: thongTinLop.id })
      const danhSachTkb = []
      for (let indexMonHoc = 0; indexMonHoc < danhSachMonHocCuaLop.length; indexMonHoc++) {
        const monHocHienTai = danhSachMonHocCuaLop[indexMonHoc]

        const thongTinTietHocCuaMonHienTai = _.filter(tkbThemThongTin, { idmonhoc: monHocHienTai.idmonhoc })
        if (thongTinTietHocCuaMonHienTai.length) {
          console.log('========================================')
          console.log('thongTinTietHocCuaMonHienTai ', thongTinTietHocCuaMonHienTai)
          console.log('========================================')
          const thuHocHienTai = thongTinTietHocCuaMonHienTai[0].thu
          let tietHocHienTai = thongTinTietHocCuaMonHienTai[0].tiet
          for (let indexTietMon = 1; indexTietMon < thongTinTietHocCuaMonHienTai.length; indexTietMon++) {
            const thongTinTietHoc = thongTinTietHocCuaMonHienTai[indexTietMon]
            tietHocHienTai = `${tietHocHienTai}.${thongTinTietHoc.tiet}`
          }
          danhSachTkb.push({
            stt: indexMonHoc + 1,
            thongtinGiangVien: thongTinTietHocCuaMonHienTai[0].thongtinGiangVien,
            thongtinLop: thongTinTietHocCuaMonHienTai[0].thongtinLop,
            thongtinMonHoc: thongTinTietHocCuaMonHienTai[0].thongtinMonHoc,
            thuHocHienTai,
            tietHocHienTai
          })
        }
      }

      return res.render('tkb/tkb-lop.html', {
        danhSachTkb,
        listClassNew,
        lop: thongTinLop,
        idtkb
      })
    }
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
      data: error
    })
  }
})

app.get('/edit/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params
    if (!id) { throw new Error('Không tìm thấy thông tin') }

    const dataEdit = await knex(type).select().where({ id }).first()
    const listTeacher = await knex('giangvien').select()
    const listClass = await knex('lop').select()
    const listSubject = await knex('monhoc').select()
    const template = `${type}/edit-${type}.html`
    res.render(template, {
      dataEdit,
      listTeacher,
      listClass,
      listSubject
    })
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
      data: error
    })
  }
})

app.post('/edit/:type/:id', async (req, res, next) => {
  try {
    const { type, id } = req.params
    const { name, note, khoahoc, sotinchi, giangvien, lop, idmonhoc, idgiangvien, idlop, mamonhoc } = req.body
    if (!id) { throw new Error('Không tìm thấy thông tin') }
    switch (type) {
      case 'giangvien':
        if (!name) { throw new Error('Tên giảng viên là bắt buộc') }
        await knex(type).where({ id }).update({ name, note })
        return res.redirect('/')
      case 'monhoc':
        if (!name) { throw new Error('Tên môn học là bắt buộc') }
        if (!mamonhoc) { throw new Error('Mã môn học là bắt buộc') }
        if (!sotinchi) { throw new Error('Vui lòng chọn số tín chỉ') }
        await knex(type).where({ id }).update({ name, sotinchi, mamonhoc })
        return res.redirect('/monhoc')
      case 'phanconggiangday':
        if (!idmonhoc) { throw new Error('Tên môn học là bắt buộc') }
        if (!idgiangvien) { throw new Error('Vui lòng chọn giảng viên') }
        if (!idlop) { throw new Error('Vui lòng chọn lớp') }
        await knex(type).where({ id }).update({ idmonhoc, idgiangvien, idlop })
        return res.redirect('/phanconggiangday')
      case 'lop':
        if (!name) { throw new Error('Tên lớp là bắt buộc') }
        if (!khoahoc) { throw new Error('Khoá học là bắt buộc') }
        await knex(type).where({ id }).update({ name, khoahoc })
        return res.redirect('/lop')
      default:
        return res.redirect('/')
    }
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
      data: error
    })
  }
})

app.post('/giangvien', async (req, res, next) => {
  try {
    const { name, note } = req.body
    if (!name) { throw new Error('Tên giảng viên là bắt buộc') }

    const idRow = await knex('giangvien').insert({ name, note })
    const infoGv = await knex('giangvien').select().where('id', idRow[0]).first()

    res.json({
      success: true,
      message: 'Thêm giảng viên thành công',
      data: infoGv
    })
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
      data: error
    })
  }
})

app.delete('/:type/:id', async (req, res, next) => {
  try {
    const { type, id } = req.params
    if (!id) { throw new Error('Không tìm thấy thông tin') }

    await knex(type).where({ id }).del()
    res.json({
      success: true,
      message: 'Xoá thành công',
      data: { id }
    })
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
      data: error
    })
  }
})

app.post('/monhoc', async (req, res, next) => {
  try {
    const { mamonhoc, name, sotinchi } = req.body

    if (!name) { throw new Error('Tên môn học là bắt buộc') }
    if (!mamonhoc) { throw new Error('Mã môn học là bắt buộc') }
    if (!sotinchi) { throw new Error('Số tín chỉ là bắt buộc') }
    const listMonTheoMa = await knex('monhoc').select().where('mamonhoc', mamonhoc)
    if (listMonTheoMa.length) {
      throw new Error('Mã môn học đã tồn tại')
    }

    const idRow = await knex('monhoc').insert({ mamonhoc, name, sotinchi })
    const infoMh = await knex('monhoc').select().where('id', idRow[0]).first()

    res.json({
      success: true,
      message: 'Thêm môn học thành công',
      data: infoMh
    })
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
      data: error
    })
  }
})

app.post('/phanconggiangday', async (req, res, next) => {
  try {
    const { idMonHoc, giangvien, lop } = req.body

    if (!idMonHoc) { throw new Error('Môn học là bắt buộc') }
    if (!giangvien) { throw new Error('Giảng viên là bắt buộc') }
    if (!lop) { throw new Error('Lớp là bắt buộc') }

    const idRow = await knex('phanconggiangday').insert({ idmonhoc: idMonHoc, idgiangvien: giangvien, idlop: lop })
    const infoPCMH = await knex('phanconggiangday').select().where('id', idRow[0]).first()

    res.json({
      success: true,
      message: 'Thêm phân công giảng dạy thành công',
      data: infoPCMH
    })
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
      data: error
    })
  }
})

app.post('/phanconggiangday2', async (req, res, next) => {
  try {
    const { idMonHoc, giangvien, lop } = req.body

    if (!idMonHoc) { throw new Error('Môn học là bắt buộc') }
    if (!giangvien) { throw new Error('Giảng viên là bắt buộc') }
    if (!lop) { throw new Error('Lớp là bắt buộc') }

    const idRow = await knex('phanconggiangday2').insert({ idmonhoc: idMonHoc, idgiangvien: giangvien, idlop: lop })
    const infoPCMH = await knex('phanconggiangday2').select().where('id', idRow[0]).first()

    res.json({
      success: true,
      message: 'Thêm phân công giảng dạy thành công',
      data: infoPCMH
    })
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
      data: error
    })
  }
})

app.post('/lop', async (req, res, next) => {
  try {
    const { name, khoahoc, buoihoc } = req.body

    if (!name) { throw new Error('Tên lớp là bắt buộc') }
    if (!khoahoc) { throw new Error('Khoá học là bắt buộc') }
    if (!buoihoc) { throw new Error('Buổi học là bắt buộc') }

    const idRow = await knex('lop').insert({ name, khoahoc, buoihoc })
    const infoLop = await knex('lop').select().where('id', idRow[0]).first()

    res.json({
      success: true,
      message: 'Thêm lớp thành công',
      data: infoLop
    })
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
      data: error
    })
  }
})

module.exports = app
