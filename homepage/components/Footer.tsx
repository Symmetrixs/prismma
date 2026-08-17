import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Linkedin, Youtube, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-[#1a1a8c] via-brand-navy to-black text-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <Image
            src="/assets/logos/prismma_white_transparent.png"
            alt="Prismma Express"
            width={170}
            height={28}
          />
          <p className="mt-5 text-sm text-white/60 max-w-xs">
            Reliable, cost-effective logistics solutions across air, sea, and land.
          </p>
          <div className="flex gap-5 mt-6">
            <a href="https://www.facebook.com/profile.php?id=61552278613121" aria-label="Facebook" className="hover:text-brand-orange transition-colors">
              <Facebook size={22} />
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-brand-orange transition-colors">
              <Instagram size={22} />
            </a>
            <a href="#" aria-label="LinkedIn" className="hover:text-brand-orange transition-colors">
              <Linkedin size={22} />
            </a>
            <a href="#" aria-label="YouTube" className="hover:text-brand-orange transition-colors">
              <Youtube size={22} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-display font-semibold text-lg mb-4">Company</h4>
          <ul className="space-y-2 text-white/70">
            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
            <li><Link href="/our-partners" className="hover:text-white transition-colors">Our Partners</Link></li>
            <li><Link href="/get-a-quote" className="hover:text-white transition-colors">Get a Quote</Link></li>
            <li><Link href="/track-shipment" className="hover:text-white transition-colors">Track Shipment</Link></li>
            <li><Link href="/latest-news" className="hover:text-white transition-colors">Latest News</Link></li>
            <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold text-lg mb-4">Services</h4>
          <ul className="space-y-2 text-white/70">
            <li><Link href="/services#air-freight" className="hover:text-white transition-colors">Air Freight</Link></li>
            <li><Link href="/services#sea-freight" className="hover:text-white transition-colors">Sea Freight</Link></li>
            <li><Link href="/services#land-transport" className="hover:text-white transition-colors">Land Transport</Link></li>
            <li><Link href="/services#warehouse-distribution" className="hover:text-white transition-colors">Warehouse and Distribution</Link></li>
            <li><Link href="/services#customs-brokerage" className="hover:text-white transition-colors">Customs Brokerage</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold text-lg mb-4">Contact</h4>
          <ul className="space-y-3 text-white/70">
            <li className="flex items-start gap-2">
              <MapPin size={18} className="mt-0.5 shrink-0" />
              <span>NO. 736, Lorong Perindustrian Bukit Minyak 11, Kawasan Bukit Minyak, 14100 Simpang Ampat, Pulau Pinang, MALAYSIA.</span>
            </li>
            <li className="flex items-start gap-2">
              <Phone size={18} className="mt-0.5 shrink-0" />
              <span>
                +6 010 660 6600
                <br />
                +6 016 850 4340
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={18} className="shrink-0" />
              <span>enquiry@prismma.net</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-white/10 py-6 text-center text-sm text-white/50">
        Copyright Prismma Express Sdn Bhd (967851-D). All Rights Reserved.
      </div>
    </footer>
  );
}
