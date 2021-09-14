with import <nixpkgs> {}; {
  sdlEnv = stdenv.mkDerivation {
    name = "alephium-js";
    shellHook = ''
    '';
    buildInputs = [
      nodejs python
    ];
  };
}
