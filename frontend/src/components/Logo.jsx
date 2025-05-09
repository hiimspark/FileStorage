import React from 'react';

function Logo({src}) {
    return (
        <a href="home" className="logo"><img src={src} width="30px" height="30px"/><b>MovieZone</b></a>
    );
}
export default Logo;