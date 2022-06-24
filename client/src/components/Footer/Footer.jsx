import React, { useState } from 'react';
import Contact from '../Contact/Contact';
import Modal from '../Modals/Modal/Modal.jsx';
import s from '../Footer/Footer.module.css'

export default function Footer() {

  const [active, setActive] = useState(false);

  const toggle = () => {
    setActive(!active);
  }

  return (
    <div className={s.containerFooter}>
      <div className={s.info}>
        {/* column1 */}
          <h4 onClick={toggle} className={s.contact}>Contactate con Nosotros</h4>
          <Modal active={active} toggle={toggle}>
              <Contact/>
          </Modal>
        {/* column2 */}
        <div className={s.redes}>
            <a className={s.facebook} href="https://www.facebook.com/profile.php?id=100082560332640" target="_blank"><i class="fa-brands fa-facebook"></i></a>
            <br />
            <a className={s.instagram} href="https://www.instagram.com/concerteck01/" target="_blank"><span></span></a>
            <br />
        </div>
      </div>
    </div>
  )
}
