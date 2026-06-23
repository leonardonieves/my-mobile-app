import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

type ApiImage = {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
};

const API_LIMIT = 8;
const CARD_HORIZONTAL_MARGIN = 20;

export default function ImagesScreen() {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<ApiImage>>(null);
  const [images, setImages] = useState<ApiImage[]>([]);
  const [page, setPage] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cardWidth = Math.max(280, width - CARD_HORIZONTAL_MARGIN * 2);

  const loadImages = useCallback(async (pageToLoad: number, shouldAppend = false) => {
    try {
      if (shouldAppend) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      const response = await fetch(
        `https://picsum.photos/v2/list?page=${pageToLoad}&limit=${API_LIMIT}`
      );

      if (!response.ok) {
        throw new Error('No se pudieron obtener las imagenes.');
      }

      const data: ApiImage[] = await response.json();

      setImages((currentImages) => (shouldAppend ? [...currentImages, ...data] : data));
      setPage(pageToLoad);

      if (!shouldAppend) {
        setActiveIndex(0);
        listRef.current?.scrollToOffset({ animated: false, offset: 0 });
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Ocurrio un error cargando las imagenes.'
      );
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadImages(1);
  }, [loadImages]);

  const imageSource = useCallback(
    (imageId: string) => ({
      uri: `https://picsum.photos/id/${imageId}/900/600`,
    }),
    []
  );

  const goToIndex = (index: number) => {
    if (index < 0 || index >= images.length) {
      return;
    }

    listRef.current?.scrollToIndex({ animated: true, index });
    setActiveIndex(index);
  };

  const loadNextPage = () => {
    loadImages(page + 1, true);
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / cardWidth);
    setActiveIndex(Math.min(Math.max(nextIndex, 0), images.length - 1));
  };

  const dots = useMemo(() => {
    const firstVisibleIndex = Math.max(0, Math.min(activeIndex - 5, images.length - 12));
    const visibleDots = images.slice(firstVisibleIndex, firstVisibleIndex + 12);

    return visibleDots.map((image, index) => (
      <View
        key={image.id}
        style={[styles.dot, firstVisibleIndex + index === activeIndex && styles.activeDot]}
      />
    ));
  }, [activeIndex, images]);

  const renderImageCard = ({ item }: ListRenderItemInfo<ApiImage>) => (
    <View style={[styles.card, { width: cardWidth }]}>
      <Image source={imageSource(item.id)} resizeMode="cover" style={styles.image} />

      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <View>
            <Text style={styles.cardEyebrow}>Autor</Text>
            <Text style={styles.cardTitle}>{item.author}</Text>
          </View>
          <View style={styles.imageBadge}>
            <MaterialIcons name="photo-camera" size={16} color="#147A4B" />
            <Text style={styles.imageBadgeText}>{item.id}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Ancho</Text>
            <Text style={styles.metaValue}>{item.width}px</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Alto</Text>
            <Text style={styles.metaValue}>{item.height}px</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>API visual</Text>
            <Text style={styles.title}>Imagenes</Text>
          </View>
          <View style={styles.counterBadge}>
            <Text style={styles.counterNumber}>{images.length}</Text>
            <Text style={styles.counterLabel}>items</Text>
          </View>
        </View>

        <View style={styles.infoPanel}>
          <MaterialIcons name="cloud-download" size={24} color="#2563EB" />
          <View style={styles.infoTextBlock}>
            <Text style={styles.infoTitle}>Carrusel conectado</Text>
            <Text style={styles.infoText}>
              Datos cargados desde Picsum Photos con cards, paginacion y controles nativos.
            </Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.statePanel}>
            <ActivityIndicator color="#2563EB" size="large" />
            <Text style={styles.stateTitle}>Cargando imagenes</Text>
          </View>
        ) : error ? (
          <View style={styles.statePanel}>
            <MaterialIcons name="error-outline" size={34} color="#D14343" />
            <Text style={styles.stateTitle}>No se pudo cargar</Text>
            <Text style={styles.stateText}>{error}</Text>
            <Pressable style={styles.primaryButton} onPress={() => loadImages(1)}>
              <MaterialIcons name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Reintentar</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <FlatList
              ref={listRef}
              data={images}
              horizontal
              pagingEnabled
              decelerationRate="fast"
              keyExtractor={(item) => item.id}
              renderItem={renderImageCard}
              showsHorizontalScrollIndicator={false}
              snapToInterval={cardWidth}
              snapToAlignment="start"
              getItemLayout={(_, index) => ({
                length: cardWidth,
                offset: cardWidth * index,
                index,
              })}
              onMomentumScrollEnd={handleScrollEnd}
              style={styles.carousel}
            />

            <View style={styles.paginationRow}>
              <Pressable
                accessibilityLabel="Imagen anterior"
                disabled={activeIndex === 0}
                onPress={() => goToIndex(activeIndex - 1)}
                style={({ pressed }) => [
                  styles.iconButton,
                  activeIndex === 0 && styles.disabledButton,
                  pressed && activeIndex > 0 ? styles.pressed : null,
                ]}>
                <MaterialIcons name="chevron-left" size={26} color="#111827" />
              </Pressable>

              <View style={styles.dotsRow}>{dots}</View>

              <Pressable
                accessibilityLabel="Imagen siguiente"
                disabled={activeIndex === images.length - 1}
                onPress={() => goToIndex(activeIndex + 1)}
                style={({ pressed }) => [
                  styles.iconButton,
                  activeIndex === images.length - 1 && styles.disabledButton,
                  pressed && activeIndex < images.length - 1 ? styles.pressed : null,
                ]}>
                <MaterialIcons name="chevron-right" size={26} color="#111827" />
              </Pressable>
            </View>

            <View style={styles.footerActions}>
              <Text style={styles.pageText}>
                Pagina API {page} - Imagen {activeIndex + 1} de {images.length}
              </Text>
              <Pressable
                onPress={loadNextPage}
                disabled={isLoadingMore}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && !isLoadingMore ? styles.pressed : null,
                ]}>
                {isLoadingMore ? (
                  <ActivityIndicator color="#2563EB" />
                ) : (
                  <>
                    <MaterialIcons name="add-photo-alternate" size={20} color="#2563EB" />
                    <Text style={styles.secondaryButtonText}>Cargar mas</Text>
                  </>
                )}
              </Pressable>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  screen: {
    flex: 1,
    paddingHorizontal: CARD_HORIZONTAL_MARGIN,
    paddingTop: 18,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  eyebrow: {
    color: '#667085',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: '#111827',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0,
    marginTop: 2,
  },
  counterBadge: {
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 8,
    minWidth: 64,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  counterNumber: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  counterLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  infoPanel: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E9F0',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
    padding: 14,
  },
  infoTextBlock: {
    flex: 1,
    gap: 3,
  },
  infoTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
  },
  infoText: {
    color: '#667085',
    fontSize: 13,
    lineHeight: 19,
  },
  carousel: {
    flexGrow: 0,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E9F0',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  image: {
    backgroundColor: '#E5E9F0',
    height: 310,
    width: '100%',
  },
  cardBody: {
    gap: 16,
    padding: 14,
  },
  cardTitleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  cardEyebrow: {
    color: '#667085',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  cardTitle: {
    color: '#111827',
    fontSize: 21,
    fontWeight: '800',
    marginTop: 2,
  },
  imageBadge: {
    alignItems: 'center',
    backgroundColor: '#DFF6EA',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 5,
    minHeight: 34,
    paddingHorizontal: 9,
  },
  imageBadgeText: {
    color: '#147A4B',
    fontSize: 12,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metaItem: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E5E9F0',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: 12,
  },
  metaLabel: {
    color: '#667085',
    fontSize: 12,
    fontWeight: '700',
  },
  metaValue: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  paginationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginTop: 14,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D8DEE9',
    borderRadius: 8,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  disabledButton: {
    opacity: 0.35,
  },
  dotsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    justifyContent: 'center',
    maxWidth: 190,
  },
  dot: {
    backgroundColor: '#CBD5E1',
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  activeDot: {
    backgroundColor: '#2563EB',
    width: 22,
  },
  footerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginTop: 14,
    paddingBottom: 24,
  },
  pageText: {
    color: '#667085',
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#EAF0FF',
    borderColor: '#BFD0FF',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    minHeight: 42,
    minWidth: 128,
    paddingHorizontal: 12,
  },
  secondaryButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '800',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 14,
    minHeight: 46,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  statePanel: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E9F0',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    justifyContent: 'center',
    minHeight: 360,
    padding: 24,
  },
  stateTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
  },
  stateText: {
    color: '#667085',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
