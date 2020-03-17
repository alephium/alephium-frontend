with import <nixpkgs> {}; {
  sdlEnv = stdenv.mkDerivation {
    name = "alephium-client";
    shellHook = ''
    '';
    buildInputs = [
      nodejs python
    ];
  };
}
