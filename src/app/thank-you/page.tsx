import PaymentStatus from "@/components/PaymentStatus";
import { PRODUCT_CATEGORIES } from "@/config";
import { getPayloadClint } from "@/get-payload";
import { getServerSideUser } from "@/lib/payload-utils";
import { formatPrice } from "@/lib/utils";
import { Product, ProductFile, User } from "@/payload-types";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const ThankYouPage = async ({ searchParams }: PageProps) => {
  const { orderId } = searchParams;
  const nextCookies = cookies();

  const { user } = await getServerSideUser(nextCookies);

  const payload = await getPayloadClint();

  const { docs: orders } = await payload.find({
    collection: "orders",
    depth: 2,
    where: {
      id: {
        equals: orderId,
      },
    },
  });

  const [order] = orders;

  if (!order) notFound();

  const orderUserId =
    typeof order.user === "string" ? order.user : order.user.id;

  if (orderUserId !== user?.id) {
    return redirect(`/sign-in?origin=thank-you?orderId=${order.id}`);
  }

  const products = order.products as Product[];

  const orderTotal = products.reduce((total, product) => {
    return total + product.price;
  }, 0);

  return (
    <main className="relative lg:min-h-full">
      <div className="hidden h-80 overflow-hidden lg:absolute lg:block lg:h-full lg:w-1/2 lg:pr-4 xl:pr-12">
        <Image
          src="/checkout-thank-you.jpg"
          className="h-full w-full object-cover object-center"
          alt={"working"}
          fill
        />
      </div>

      <div>
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-32 xl:gap-x-24">
          <div className="lg:col-start-2">
            <p className="text-sm font-medium text-primary">
              Order Successfull
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
              Thanks for ordering
            </h1>
            {order._isPaid ? (
              <p className="mt-2 text-base text-muted-foreground">
                Your order was processed and your assets are available to
                download below. We&apos;ve sent your reciept and order details
                to{" "}
                {typeof order.user !== "string" ? (
                  <span className="font-medium text-neutral-900">
                    {order.user.email}
                  </span>
                ) : null}
                .
              </p>
            ) : (
              <p>
                We appriciate your order, and we&apos;re currently processing
                it. So hang tight and we&apos;ll send confirmation very soon!
              </p>
            )}

            <div className="mt-16 text-sm font-medium">
              <div className="text-muted-foreground">Order nr.</div>
              <div className="mt-2 text-neutral-900">{order.id}</div>

              <ul className="font-sm mt-6 divide-y divide-neutral-200 border-t border-neutral-200 font-medium text-muted-foreground">
                {(order.products as Product[]).map((product) => {
                  const label = PRODUCT_CATEGORIES.find(
                    ({ value }) => value === product.category,
                  )?.label;

                  const downloadUrl = (product.product_files as ProductFile)
                    .url as string;

                  const { image } = product.Images[0];

                  return (
                    <li key={product.id} className="flex space-x-6 py-6">
                      <div className="relative h-24 w-24">
                        {typeof image !== "string" && image.url ? (
                          <Image
                            src={image.url}
                            fill
                            alt={`${product.name} image`}
                            className="flex-none rounded-md bg-neutral-100 object-cover object-center"
                          />
                        ) : null}
                      </div>

                      <div className="flex flex-auto flex-col justify-between">
                        <div className="space-y-1">
                          <h3 className="text-neutral-900">{product.name}</h3>
                          <p className="my-1">Category: {label}</p>
                        </div>

                        {order._isPaid ? (
                          <a
                            href={downloadUrl}
                            download={product.name}
                            className="text-neutral-600 hover:underline hover:underline-offset-2"
                          >
                            Download Asset
                          </a>
                        ) : null}
                      </div>
                      <p className="flex-none font-medium text-neutral-900">
                        {formatPrice(product.price)}
                      </p>
                    </li>
                  );
                })}
              </ul>

              <div className="space-y-6 border-t border-neutral-200 pt-6 text-sm font-medium text-muted-foreground">
                <div className="flex justify-between">
                  <p>Subtotal</p>
                  <p className="text-neutral-900">{formatPrice(orderTotal)}</p>
                </div>

                <div className="flex justify-between">
                  <p>Transaction Fee</p>
                  <p className="text-neutral-900">{formatPrice(1)}</p>
                </div>

                <div className="flex items-center justify-between border-t border-neutral-200 pt-6 text-neutral-900">
                  <p className="text-base">Total</p>
                  <p className="text-base">{formatPrice(orderTotal + 1)}</p>
                </div>
              </div>

              <PaymentStatus
                isPaid={order._isPaid}
                orderEmail={(order.user as User).email}
                orderId={order.id}
              />

              <div className="mt-16 border-t border-neutral-200 py-6 text-right">
                <Link
                  href="/products"
                  className="text-sm font-medium text-neutral-600 hover:text-neutral-500"
                >
                  Continue Shoping &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ThankYouPage;
