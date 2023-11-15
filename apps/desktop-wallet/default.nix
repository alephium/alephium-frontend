with import <nixpkgs> {}; {
  sdlEnv = stdenv.mkDerivation {
    name = "alephium-desktop-wallet";
    shellHook = ''
    '';
    buildInputs = [
      python nodejs electron
    ];
  };
}
