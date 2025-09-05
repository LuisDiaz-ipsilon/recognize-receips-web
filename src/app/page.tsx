"use client";

import { useRef, useState } from "react";
import { Button, Card, CardBody, Input, Divider, Spinner, Form, CardHeader, Code, CircularProgress } from "@heroui/react";
import { FaUpload, FaPlay, FaExternalLinkAlt } from "react-icons/fa";
import { Link } from "@heroui/link";

type ApiOk = { monto?: string | number; file?: string; [k: string]: any };
type ApiErr = { message?: string; error?: string; statusCode?: number; [k: string]: any };

export default function Page() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [idclient, setIdclient] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<ApiOk | null>(null);
  const [err, setErr] = useState<ApiErr | null>(null);

  const pickFile = () => fileRef.current?.click();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOk(null);
    setErr(null);

    const file = fileRef.current?.files?.[0];
    if (!file) {
      setErr({ message: "Selecciona una imagen" });
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append("image", file);
      form.append("idclient", idclient);

      const res = await fetch("/recognize-receipts/api/run", { method: "POST", body: form });

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : { message: await res.text() };

      if (!res.ok) {
        setErr(data);
        setOk(null);
      } else {
        setOk(data);
        setErr(null);
      }
    } catch (e: any) {
      setErr({ message: e?.message || "Error desconocido" });
    } finally {
      setLoading(false);
    }
  };

  const montoDisplay =
    ok?.monto !== undefined && ok?.monto !== null
      ? `$ ${String(ok.monto)}`
      : null;

  return (
    <div className="min-h-dvh bg-gradient-to-br from-[#0b1020] via-[#0f172a] to-[#0a1f45] text-white">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Logo rectangular (coloca tu archivo en /public/logo-rectangle.png o usa el placeholder) */}
            <Link href="https://softwarefabrik.com.mx/">
              <img
                src="/logo-white.svg"
                alt="Logo"
                className="h-10 w-auto rounded"
              />
            </Link>
            <span className="text-sm text-slate-300">Process Receipt API</span>
          </div>
          <nav className="hidden items-center gap-4 sm:flex">
            <a href="#run" className="text-sm text-slate-300 hover:text-white">Probar</a>
            <a href="#info" className="text-sm text-slate-300 hover:text-white">Info</a>
            <a href="#docs" className="text-sm text-slate-300 hover:text-white">Docs</a>
            <a href="#contribuidor" className="text-sm text-slate-300 hover:text-white">Contribuidor</a>
          </nav>
        </div>
      </header>

      {/* SECTION 1: FORM + RESULT */}
      <section id="run" className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Formulario */}
          <Card className=" border border-slate-800 py-4">
            <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
              <p className="text-xl font-bold">Probar</p>
              <small>Comprobantes admitidos actualmente: BBVA</small>
            </CardHeader>
            <CardBody className="overflow-visible py-2 px-4 flex items-center justify-center">
              <Form onSubmit={onSubmit} className="flex flex-col items-center justify-center gap-4 w-full">
                <Input
                  label="Clave"
                  placeholder="100GRATISDIARIOS"
                  value=''
                  onValueChange={setIdclient}
                />

                <div className="">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
                  />
                  <Button 
                    className="bg-sky-400 text-black font-bold hover:bg-sky-100"
                    variant="solid" onPress={pickFile} startContent={<FaUpload />}>
                    {fileName ? `Imagen: ${fileName}` : "Selecciona Comprobante"}
                  </Button>
                </div>

                <Button
                  className="bg-sky-200 text-black font-bold hover:bg-sky-100"
                  type="submit"
                  startContent={loading ? <Spinner size="sm" /> : <FaPlay />}
                  isDisabled={loading}
                >
                  {loading ? "Procesando..." : "Run"}
                </Button>
              </Form>
            </CardBody>
          </Card>

          {/* Panel de resultado */}
          <Card className="border border-slate-800 p-2">
            <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
              <p className="text-xl font-bold">Resultado</p>
            </CardHeader>
            <CardBody className="pb-0 pt-2 px-4 flex-col items-center justify-center">


              <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-5">
                {loading ? (
                  <CircularProgress label="Loading..." />
                ): ok ? (
                  <div className="space-y-3">
                    <div className="text-5xl font-extrabold tracking-tight text-emerald-400">
                      {montoDisplay ?? "—"}
                    </div>
                    <p className="text-sm text-slate-400">
                      {ok.file ? <>Archivo: <code className="text-slate-300">{ok.file}</code></> : "Sin archivo en la respuesta."}
                    </p>
                    <div className="h-px bg-slate-700" />
                    <Code>
                      {JSON.stringify(ok, null, 2)}
                    </Code>
                  </div>
                ) : err ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-red-300">
                      <span className="font-semibold">Ocurrió un error</span>
                    </div>
                    <div className="text-2xl font-bold text-red-400">
                      {"Error"}
                    </div>
                    <Code>
                      {JSON.stringify(err, null, 2)}
                    </Code>
                  </div>
                ) : (
                  <div className="text-slate-400">{'{ ... }'}</div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      <Divider className="mx-auto max-w-6xl border-slate-800" />

      {/* SECTION 2: INFO */}
      <section id="info" className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-2 text-xl font-semibold">Resume</h2>
        <p className="max-w-3xl text-slate-300">
          La API <b>Process Receipt</b> recibe una imagen de un comprobante de transferencia bancario en Base64 y devuelve el
          <b> monto detectado</b>.<br/> Ideal para flujos de validación y automatización de registros de pago.
        </p>
      </section>

      {/* SECTION 3: Obtener ID Cliente */}
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <Card className="bg-slate-900/60 border border-slate-800">
          <CardBody className="space-y-2">
            <h3 className="text-lg font-semibold">¿Necesitas implementarlo?</h3>
            <p className="text-slate-300">
              Puedes solicitar tu propia clave escribiendo a nuestro equipo de ventas:
              {" "}
              <a className="underline hover:text-white" href="mailto:ventas@softwarefabrik.com">
                ventas@softwarefabrick.ls
              </a>
              .
            </p>
          </CardBody>
        </Card>
      </section>

      <Divider className="mx-auto max-w-6xl border-slate-800" />

      {/* SECTION 4: Docs */}
      <section id="docs" className="mx-auto max-w-6xl px-4 py-12 space-y-6">
        <div>
          <h2 className="mb-2 text-xl font-semibold">Documentación</h2>
          <p className="text-slate-300">
            Endpoint de producción:{" "}
            <a
              className="inline-flex items-center gap-2 underline hover:text-white"
              href="x/api/process-receipt"
              target="_blank"
              rel="noreferrer"
            >
              x.com/api/process-receipt <FaExternalLinkAlt className="inline" />
            </a>
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className=" border border-slate-800">
            <CardBody className="space-y-3">
              <h3 className="font-semibold">Request Body</h3>
              <Code className="whitespace-pre">
                {JSON.stringify(
                  {
                    idclient: "0b3708ff-fe8a-4b66-9342-dbd747f2ef4a",
                    imageBase64: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wC..."
                  },
                  null,
                  2
                )}
              </Code>
            </CardBody>
          </Card>

          <Card className="border border-slate-800">
            <CardBody className="space-y-3">
              <h3 className="font-semibold">Respuesta (OK)</h3>
              <Code className="whitespace-pre">
                {JSON.stringify(
                  {
                    monto: "526.00",
                    file: "0b3708ff-fe8a-4b66-9342-dbd747f2ef4a_20250829032749.jpg"
                  },
                  null,
                  2
                )}
              </Code>
              <h3 className="pt-3 font-semibold">Respuesta de ejemplo (Error 400)</h3>
              <Code className="whitespace-pre">
                {JSON.stringify(
                  {
                    message: "La imagen ya fue procesada antes.",
                    error: "Bad Request",
                    "statusCode": 400
                  },
                  null,
                  2
                )}
              </Code>              
            </CardBody>
          </Card>
        </div>
      </section>

      {/* SECTION 5: Contribuidor */}
      <section id="contribuidor" className="px-4 py-12">
        <div className="mx-auto flex max-w-6xl items-center justify-center">
          <Card className="w-full max-w-md bg-slate-900/60 border border-slate-800"
            onClick={() => window.open("https://github.com/LuisDiaz-ipsilon", "_blank")}>
            <CardBody className="flex flex-col items-center gap-4 py-8">
              <img
                src="https://avatars.githubusercontent.com/u/54384617?v=4"
                className="w-24 h-24 rounded-full object-cover"
              />
              <div className="text-center">
                <h3 className="text-xl font-bold">Luis Diaz</h3>
                <p className="text-slate-400">Developer</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row">
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} softwarefabrik. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
          <Link href="https://softwarefabrik.com.mx/">
            <img
              src="/logo-white.svg"
              alt="Logo"
              className="h-10 w-auto rounded"
            />
          </Link>
            <a href="#info" className="hover:text-white">Acerca de</a>
            <a href="#docs" className="hover:text-white">Documentación</a>
            <a href="#contribuidor" className="hover:text-white">Contribuidor</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
