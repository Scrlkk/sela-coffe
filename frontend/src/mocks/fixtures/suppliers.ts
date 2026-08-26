import type { SupplierItem } from "@/services/supplier";

export const INITIAL_SUPPLIERS: SupplierItem[] = [
  {
    id: "sup_1",
    name: "PT Sangkar Kopi Utama",
    contactPerson: "Pak Ahmad",
    phone: "081122334455",
    link: "https://tokopedia.com/sangkarkopi",
    address: "Jl. Merdeka No. 45, Bandung",
    isDeleted: false,
  },
  {
    id: "sup_2",
    name: "CV Java Roastery",
    contactPerson: "Ibu Dian",
    phone: "085678901234",
    link: "https://shopee.co.id/javaroastery",
    address: "Jl. Dipatiukur No. 12, Bandung",
    isDeleted: false,
  },
  {
    id: "sup_3",
    name: "UD Susu Fresh Farm",
    contactPerson: "Mas Budi",
    phone: "081987654321",
    link: "https://wa.me/6281987654321",
    address: "Jl. Raya Lembang No. 88, KBB",
    isDeleted: false,
  },
  {
    id: "sup_4",
    name: "PT Sirup Nusantara",
    contactPerson: "Siti Rahma",
    phone: "087711223344",
    link: "https://tokopedia.com/sirupnusantara",
    address: "Kawasan Industri Cimahi Blok C3",
    isDeleted: false,
  },
];
